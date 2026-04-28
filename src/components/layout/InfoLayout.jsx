import Header from './Header'
import Footer from './Footer'
import Container from './Container'

const InfoLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Banner Section */}
        <section className="bg-primary-600 py-16 md:py-24 text-white">
          <Container>
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl text-primary-100 font-light leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </Container>
        </section>

        {/* Content Section */}
        <section className="py-16 md:py-20">
          <Container>
            <div className="bg-white rounded-3xl -mt-24 md:-mt-32 p-8 md:p-12 shadow-xl border border-gray-100">
              <div className="prose prose-lg max-w-none text-gray-600">
                {children}
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default InfoLayout
