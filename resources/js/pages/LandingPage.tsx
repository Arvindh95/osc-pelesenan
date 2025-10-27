import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            OSC Pelesenan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistem Pengurusan Pelesenan Pihak Berkuasa Tempatan
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
            >
              Log Masuk
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition duration-200"
            >
              Daftar Akaun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
