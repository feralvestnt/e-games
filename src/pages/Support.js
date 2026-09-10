import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import MainHeader from '../components/MainHeader';
import Navbar from '../components/Navbar';

function Support() {
  return (
    <>
      <Navbar />
      <MainHeader />

      <main className="bg-gray-50 min-h-screen px-5 py-10 lg:px-10">
        <section className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-800">Suporte</h1>
          <p className="text-sm text-gray-500 mt-2 mb-8">
            Entre em contato caso precise de ajuda com o sistema de vouchers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:fernando.dev.holder@gmail.com"
              className="rounded-xl border border-gray-200 p-5 hover:bg-gray-50 transition-colors"
            >
              <FontAwesomeIcon icon={faEnvelope} className="text-xl text-[#CC5A00] mb-3" />
              <p className="text-xs uppercase tracking-wide text-gray-500">E-mail</p>
              <p className="mt-1 font-semibold text-gray-800 break-all">fernando.dev.holder@gmail.com</p>
            </a>

            <a
              href="https://wa.me/34666879578"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-gray-200 p-5 hover:bg-gray-50 transition-colors"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xl text-green-600 mb-3" />
              <p className="text-xs uppercase tracking-wide text-gray-500">WhatsApp</p>
              <p className="mt-1 font-semibold text-gray-800">+34 666 87 95 78</p>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

export default Support;
