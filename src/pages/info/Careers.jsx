import InfoLayout from '../../components/layout/InfoLayout'
import { Briefcase, MapPin, Clock } from 'lucide-react'

const Careers = () => {
  const jobs = [
    { title: 'Frontend Developer (React)', location: 'Remote / Yogyakarta', type: 'Full-time' },
    { title: 'UX Designer', location: 'Yogyakarta', type: 'Full-time' },
    { title: 'Social Media Manager', location: 'Remote', type: 'Full-time' },
    { title: 'Customer Support Lead', location: 'Yogyakarta', type: 'Contract' },
  ]

  return (
    <InfoLayout 
      title="Gabung Bersama Kami" 
      subtitle="Bantu kami membangun masa depan perdagangan sirkular di Indonesia."
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Kenapa Thriftly?</h2>
          <div className="grid md:grid-cols-2 gap-8 text-base">
            <p>
              Di Thriftly, kami menghargai kreativitas, inovasi, dan dampak nyata. Kami memberikan kebebasan bagi tim kami untuk bereksperimen dan tumbuh bersama. Kamu tidak hanya sekadar bekerja; kamu sedang berkontribusi pada planet yang lebih hijau.
            </p>
            <p>
              Kami menawarkan jam kerja fleksibel, asuransi kesehatan premium, dan lingkungan kerja yang mendukung work-life balance. Mari ciptakan sesuatu yang luar biasa bersama-sama.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Peluang Karir Saat Ini</h2>
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-300 transition-all cursor-pointer group">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center"><MapPin size={14} className="mr-1" /> {job.location}</span>
                    <span className="flex items-center"><Clock size={14} className="mr-1" /> {job.type}</span>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 px-6 py-2 bg-white text-primary-600 font-bold rounded-xl border border-primary-200 hover:bg-primary-600 hover:text-white transition-all">
                  Lamar Sekarang
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary-50 p-8 rounded-3xl text-center">
          <h3 className="text-xl font-bold text-primary-900 mb-2">Tidak menemukan posisi yang cocok?</h3>
          <p className="text-primary-700 mb-6">Kirimkan CV dan portofolio kamu ke careers@thriftly.com untuk kami tinjau di masa mendatang.</p>
          <button className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all">
            Kirim Lamaran Terbuka
          </button>
        </section>
      </div>
    </InfoLayout>
  )
}

export default Careers
