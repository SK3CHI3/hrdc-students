'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Student {
  id: string
  full_name: string
  email: string
  unique_student_code: string
  institution_id: string
  created_at: string
  institutions?: {
    name: string
    category: string
  }
}

interface Institution {
  id: string
  name: string
  category: 'university' | 'college'
  created_at: string
}

interface Stats {
  totalStudents: number
  universities: number
  colleges: number
  byCategory: { category: string; count: number }[]
  categoryDistribution: { name: string; value: number }[]
}

const COLORS = ['#29AB87', '#1E7A5F', '#4CAF50', '#81C784', '#A5D6A7']

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, universities: 0, colleges: 0, byCategory: [], categoryDistribution: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'institutions'>('overview')
  const [showAddInstitution, setShowAddInstitution] = useState(false)
  const [newInstitution, setNewInstitution] = useState({ name: '', category: 'university' })
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!adminData || !adminData.is_super_admin) {
      router.push('/dashboard')
      return
    }

    fetchData()
  }

  const fetchData = async () => {
    setLoading(true)

    // Fetch students
    const { data: studentsData } = await supabase
      .from('students')
      .select(`
        *,
        institutions (
          name,
          category
        )
      `)
      .order('created_at', { ascending: false })

    // Fetch institutions
    const { data: institutionsData } = await supabase
      .from('institutions')
      .select('*')
      .order('name')

    if (studentsData) setStudents(studentsData)
    if (institutionsData) setInstitutions(institutionsData)

    // Calculate stats
    if (studentsData && institutionsData) {
      const universities = institutionsData.filter(i => i.category === 'university').length
      const colleges = institutionsData.filter(i => i.category === 'college').length
      
      const byCategory = institutionsData.map(inst => ({
        category: inst.name,
        count: studentsData.filter(s => s.institution_id === inst.id).length
      })).filter(c => c.count > 0).sort((a, b) => b.count - a.count)

      // Calculate category distribution (university vs college student counts)
      const universityStudents = studentsData.filter(s => {
        const inst = institutionsData.find(i => i.id === s.institution_id)
        return inst?.category === 'university'
      }).length
      const collegeStudents = studentsData.filter(s => {
        const inst = institutionsData.find(i => i.id === s.institution_id)
        return inst?.category === 'college'
      }).length

      setStats({
        totalStudents: studentsData.length,
        universities,
        colleges,
        byCategory,
        categoryDistribution: [
          { name: 'Universities', value: universityStudents },
          { name: 'Colleges', value: collegeStudents }
        ]
      })
    }

    setLoading(false)
  }

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('institutions')
      .insert(newInstitution)

    if (!error) {
      setShowAddInstitution(false)
      setNewInstitution({ name: '', category: 'university' })
      fetchData()
    }
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    const { error } = await supabase
      .from('students')
      .update({
        full_name: editingStudent.full_name,
        email: editingStudent.email,
        institution_id: editingStudent.institution_id,
      })
      .eq('id', editingStudent.id)

    if (!error) {
      setEditingStudent(null)
      fetchData()
    }
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('KHRSA - HR Students Association of Kenya - Student List', 14, 22)
    
    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32)
    doc.text(`Total Students: ${students.length}`, 14, 38)

    const tableData = students.map(s => [
      s.full_name,
      s.email,
      s.unique_student_code,
      s.institutions?.name || 'N/A'
    ])

    autoTable(doc, {
      head: [['Name', 'Email', 'Student Code', 'Institution']],
      body: tableData,
      startY: 45,
    })

    doc.save('hr-students-list.pdf')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jungle-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/hr_logo.png" alt="KHRSA" width={44} height={44} className="rounded-full" />
            <div>
              <h1 className="text-2xl font-bold text-jungle-green-dark">KHRSA</h1>
              <p className="text-sm text-gray-600">Super Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'students', 'institutions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-jungle-green text-jungle-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-jungle-green-dark">{stats.totalStudents}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600">Universities</p>
                <p className="text-3xl font-bold text-jungle-green-dark">{stats.universities}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600">Colleges</p>
                <p className="text-3xl font-bold text-jungle-green-dark">{stats.colleges}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Pie Chart - Students by Category */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Students by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart - Students by Institution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Students by Institution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.byCategory.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#29AB87" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Students by Institution List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">All Institutions with Students</h3>
              <div className="space-y-3">
                {stats.byCategory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-jungle-green h-2 rounded-full"
                          style={{ width: `${stats.totalStudents > 0 ? (item.count / stats.totalStudents) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">All Students</h3>
              <button
                onClick={handleDownloadPDF}
                className="bg-jungle-green hover:bg-jungle-green-dark text-white px-4 py-2 rounded-lg transition"
              >
                Download PDF
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-jungle-green-dark">{student.unique_student_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.institutions?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="text-jungle-green hover:text-jungle-green-dark"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'institutions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Institutions</h3>
              <button
                onClick={() => setShowAddInstitution(true)}
                className="bg-jungle-green hover:bg-jungle-green-dark text-white px-4 py-2 rounded-lg transition"
              >
                Add Institution
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {institutions.map((inst) => (
                <div key={inst.id} className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800">{inst.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{inst.category}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {students.filter(s => s.institution_id === inst.id).length} students
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Institution Modal */}
      {showAddInstitution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Institution</h3>
            <form onSubmit={handleAddInstitution} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newInstitution.category}
                  onChange={(e) => setNewInstitution({ ...newInstitution, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none"
                >
                  <option value="university">University</option>
                  <option value="college">College</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-jungle-green hover:bg-jungle-green-dark text-white py-2 rounded-lg transition"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddInstitution(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Student</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.full_name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, full_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <select
                  value={editingStudent.institution_id}
                  onChange={(e) => setEditingStudent({ ...editingStudent, institution_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent outline-none"
                >
                  <option value="">Select institution</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-jungle-green hover:bg-jungle-green-dark text-white py-2 rounded-lg transition"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}