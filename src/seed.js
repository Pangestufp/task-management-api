import sequelize from './config/database.js'
import User from './models/user.js'
import Project from './models/project.js'
import Task from './models/task.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const PEPPER = process.env.PEPPER

const hashPassword = async (password) => {
  return bcrypt.hash(password + PEPPER, 10)
}

async function seed() {
  try {
    await sequelize.sync({ force: true })

    const admin = await User.create({
      name: 'admin',
      email: 'admin@gmail.com',
      password: await hashPassword('123456'),
      role: 'admin'
    })

    const user = await User.create({
      name: 'user',
      email: 'user@gmail.com',
      password: await hashPassword('123456'),
      role: 'user'
    })

    const projects = await Project.bulkCreate([
      {
        name: 'Website Redesign',
        description: 'Redesign halaman utama dan dashboard perusahaan',
        created_by: admin.id
      },
      {
        name: 'Mobile App Development',
        description: 'Pengembangan aplikasi mobile untuk iOS dan Android',
        created_by: admin.id
      },
      {
        name: 'API Integration',
        description: 'Integrasi third-party API untuk payment gateway',
        created_by: admin.id
      },
      {
        name: 'Database Migration',
        description: 'Migrasi database dari MySQL ke PostgreSQL',
        created_by: admin.id
      },
      {
        name: 'DevOps Setup',
        description: 'Setup CI/CD pipeline dan konfigurasi server production',
        created_by: admin.id
      }
    ])

    const taskTemplates = [
      [
        { title: 'Buat wireframe halaman utama', description: 'Desain wireframe menggunakan Figma', status: 'done', priority: 'high' },
        { title: 'Implementasi UI komponen navbar', description: 'Buat komponen navbar responsif', status: 'done', priority: 'high' },
        { title: 'Integrasi API data dashboard', description: 'Hubungkan frontend ke endpoint dashboard', status: 'in_progress', priority: 'medium' },
        { title: 'Testing cross-browser', description: 'Uji tampilan di Chrome, Firefox, dan Safari', status: 'todo', priority: 'medium' },
        { title: 'Deploy ke staging', description: 'Push build ke server staging untuk review', status: 'todo', priority: 'low' }
      ],
      [
        { title: 'Setup project React Native', description: 'Inisialisasi project dan konfigurasi environment', status: 'done', priority: 'high' },
        { title: 'Buat halaman login & register', description: 'Form autentikasi dengan validasi', status: 'done', priority: 'high' },
        { title: 'Implementasi push notification', description: 'Integrasi Firebase Cloud Messaging', status: 'in_progress', priority: 'high' },
        { title: 'Buat halaman profil user', description: 'Tampilkan dan edit data profil', status: 'todo', priority: 'medium' },
        { title: 'Testing di device fisik', description: 'QA di perangkat Android dan iPhone', status: 'todo', priority: 'medium' }
      ],
      [
        { title: 'Riset dokumentasi payment API', description: 'Pelajari endpoint Midtrans / Xendit', status: 'done', priority: 'high' },
        { title: 'Buat service layer payment', description: 'Abstraksi logic pembayaran ke service', status: 'in_progress', priority: 'high' },
        { title: 'Implementasi webhook handler', description: 'Handle callback status transaksi', status: 'in_progress', priority: 'high' },
        { title: 'Buat unit test payment flow', description: 'Test skenario sukses, gagal, dan pending', status: 'todo', priority: 'medium' },
        { title: 'Dokumentasi API internal', description: 'Tulis dokumentasi endpoint di Postman/Swagger', status: 'todo', priority: 'low' }
      ],
      [
        { title: 'Audit skema database lama', description: 'Dokumentasikan semua tabel dan relasi existing', status: 'done', priority: 'high' },
        { title: 'Buat script migrasi tabel utama', description: 'Konversi DDL MySQL ke PostgreSQL', status: 'done', priority: 'high' },
        { title: 'Migrasi data historis', description: 'Dump dan import data produksi ke DB baru', status: 'in_progress', priority: 'high' },
        { title: 'Validasi integritas data', description: 'Bandingkan row count dan sample data', status: 'todo', priority: 'high' },
        { title: 'Update koneksi di aplikasi', description: 'Ganti config DB di semua service', status: 'todo', priority: 'medium' }
      ],
      [
        { title: 'Setup GitHub Actions workflow', description: 'Buat pipeline CI untuk lint dan test otomatis', status: 'done', priority: 'high' },
        { title: 'Konfigurasi Docker & docker-compose', description: 'Containerize aplikasi dan database', status: 'done', priority: 'high' },
        { title: 'Setup server VPS production', description: 'Install Nginx, SSL, dan konfigurasi firewall', status: 'in_progress', priority: 'high' },
        { title: 'Implementasi CD ke production', description: 'Auto-deploy ke VPS setelah merge ke main', status: 'todo', priority: 'medium' },
        { title: 'Setup monitoring & alerting', description: 'Integrasi Grafana / UptimeRobot untuk monitoring', status: 'todo', priority: 'low' }
      ]
    ]

    const allTasks = []
    for (let i = 0; i < projects.length; i++) {
      const tasks = taskTemplates[i].map(task => ({
        ...task,
        project_id: projects[i].id,
        assignee_id: user.id
      }))
      allTasks.push(...tasks)
    }

    await Task.bulkCreate(allTasks)

    console.log("Seed berhasil")
    process.exit(0)

  } catch (err) {
    console.error("Seed gagal:", err)
    process.exit(1)
  }
}

seed()