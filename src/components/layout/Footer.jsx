import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, FileText } from 'lucide-react';
import Logo from '../ui/Logo.jsx';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-primary-100 shadow-pink-lg text-left mt-8 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Wordmark */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center group">
              <Logo showCircle={false} showSubtitle={false} size="h-20" className="group-hover:scale-105 transition-transform duration-300" />
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              "Your Fashion Destination | Your Style, Your Way!"
              Discover premium women's clothing, ethnic wear, co-ord sets, and korean night wear curated for your unique grace.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <ShieldCheck size={16} />
              <span>100% Genuine Quality Products</span>
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-800 tracking-widest">
              Store Information
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-xs text-gray-600">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Block Office Road, Opposite Thrissur Gold Palace, Near Federal Bank, Kollengode, Kerala, India - 678506
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-gray-600">
                <Phone size={16} className="text-primary shrink-0" />
                <span>+91 812988 98313 | +91 70120 65738</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-gray-600">
                <Mail size={16} className="text-primary shrink-0" />
                <span>support@girlystore.in</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs pt-2 border-t border-primary-50/30">
                <FileText size={16} className="text-primary shrink-0" />
                <Link to="/terms" className="text-xs text-gray-600 hover:text-primary font-bold transition-colors hover:underline">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Hours */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-800 tracking-widest">
              Business Hours
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-xs text-gray-600">
                <Clock size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800">Open Daily</p>
                  <p className="mt-0.5 text-[11px] text-gray-500 font-medium">9:30 AM – 8:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Brand-Themed Social Contacts */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-800 tracking-widest">
              Connect With Us
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a
                href="https://www.youtube.com/redirect?event=channel_header&redir_token=QUFFLUhqbHFOQ2tlMW5WLTl2TXI1aWtwTnhwRmdPQ1FfUXxBQ3Jtc0trc3hoWmVyVXRnOFNjOW1Rc1ZfNmpOT0FEcDgwZXNzM2p6SUlMeTJPd2t0dXNzOXlzaE5acnh5ZlAtRkJNT0k1ZUZkTFNXcGlRN3pNd3ZBR2hnUmcxX3ZfVVkyLVNFbl9HM3NtTXlVejJidENtZ2pYcw&q=https%3A%2F%2Fwa.me%2Fc%2F919048313808"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 bg-primary-50/20 hover:bg-primary-50/60 rounded-xl transition-all duration-300 hover:-translate-y-1 text-xs font-semibold text-gray-700 hover:text-primary hover:shadow-[0_8px_20px_rgba(236,72,153,0.12)] group"
              >
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.978 14.12 .952 11.49.952c-5.445 0-9.873 4.372-9.877 9.802-.001 1.77.464 3.5 1.348 5.048l-.97 3.546 3.656-.959zm11.102-7.534c-.29-.145-1.713-.845-1.978-.94-.266-.096-.459-.145-.653.145-.193.29-.748.94-.917 1.13-.169.19-.338.215-.628.07-1.84-.922-3.043-1.634-4.25-3.708-.317-.546.317-.507.908-1.69.1-.195.05-.365-.025-.51-.075-.145-.653-1.573-.895-2.152-.236-.569-.475-.492-.653-.501-.17-.008-.363-.01-.556-.01-.193 0-.507.072-.772.36-.266.29-1.014.992-1.014 2.422 0 1.43 1.039 2.81 1.184 3.002.145.19 2.045 3.12 4.956 4.376.692.3 1.232.479 1.653.613.695.22 1.33.188 1.83.114.557-.08 1.713-.7 1.953-1.378.24-.678.24-1.26.169-1.378-.071-.12-.266-.19-.556-.335z"/>
                  </svg>
                </div>
                <span>WhatsApp</span>
              </a>

              <a
                href="https://www.instagram.com/girly_kollengode?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 bg-primary-50/20 hover:bg-primary-50/60 rounded-xl transition-all duration-300 hover:-translate-y-1 text-xs font-semibold text-gray-700 hover:text-primary hover:shadow-[0_8px_20px_rgba(236,72,153,0.12)] group"
              >
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <span>Instagram</span>
              </a>

              <a
                href="https://www.youtube.com/redirect?event=channel_description&redir_token=QUFFLUhqbFZ1ZU9CUldhUDZyR0hBSUVLUDFqYkx4TV8zUXxBQ3Jtc0tuZWRUTUNHWk1zQ0VyUnFYUVBKZWhNMzh1cTB1X3JtWmJTekVPdUtQaTJFcmhnNGVleDZCMkduVnk0UHBfM2pxdFlYdGRuSXhfNndCVjRHMVktVVV4b0V2N3ZITVV4bk14UzdXel9mdHFiZlV0amx4Zw&q=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61563868078173"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 bg-primary-50/20 hover:bg-primary-50/60 rounded-xl transition-all duration-300 hover:-translate-y-1 text-xs font-semibold text-gray-700 hover:text-primary hover:shadow-[0_8px_20px_rgba(236,72,153,0.12)] group"
              >
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span>Facebook</span>
              </a>

              <a
                href="https://youtube.com/@its_me_vidy_a?si=dIQKZPUH-GBFJTEO"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 bg-primary-50/20 hover:bg-primary-50/60 rounded-xl transition-all duration-300 hover:-translate-y-1 text-xs font-semibold text-gray-700 hover:text-primary hover:shadow-[0_8px_20px_rgba(236,72,153,0.12)] group"
              >
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 pt-6 border-t border-primary-50/50 flex flex-col items-center justify-center text-center text-xs text-gray-400 font-medium gap-2">
          <p>© {new Date().getFullYear()} Girly Women's Clothing Store. All Rights Reserved.</p>
          <p className="flex items-center justify-center gap-1 mt-0.5">
            Crafted with <Heart size={10} className="text-primary fill-primary animate-pulse" /> in Kollengode, Kerala
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
