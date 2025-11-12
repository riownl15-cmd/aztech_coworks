'use client';

import { Building2 } from 'lucide-react';

const companies = [
  { name: 'Tata', logo: 'https://logo.clearbit.com/tata.com' },
  { name: 'Infosys', logo: 'https://logo.clearbit.com/infosys.com' },
  { name: 'Wipro', logo: 'https://logo.clearbit.com/wipro.com' },
  { name: 'TCS', logo: 'https://logo.clearbit.com/tcs.com' },
  { name: 'Reliance', logo: 'https://logo.clearbit.com/ril.com' },
  { name: 'Mahindra', logo: 'https://logo.clearbit.com/mahindra.com' },
  { name: 'Tech Mahindra', logo: 'https://logo.clearbit.com/techmahindra.com' },
  { name: 'HCL', logo: 'https://logo.clearbit.com/hcltech.com' },
  { name: 'Bharti Airtel', logo: 'https://logo.clearbit.com/airtel.in' },
  { name: 'ICICI Bank', logo: 'https://logo.clearbit.com/icicibank.com' },
  { name: 'HDFC Bank', logo: 'https://logo.clearbit.com/hdfcbank.com' },
  { name: 'Axis Bank', logo: 'https://logo.clearbit.com/axisbank.com' },
];

export default function TrustedCompanies() {
  const doubledCompanies = [...companies, ...companies];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 mb-4 sm:mb-6">
            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Trusted by <span className="text-blue-600">300+</span> Companies
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Join India's leading companies that choose us for their workspace needs
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-blue-50 to-transparent z-10" />

          <div className="flex animate-scroll-logos">
            {doubledCompanies.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 mx-4 sm:mx-6 md:mx-8"
              >
                <div className="group relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center p-6 sm:p-8 border border-gray-100 hover:border-blue-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  <div className="relative flex flex-col items-center justify-center gap-3">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const icon = document.createElement('div');
                          icon.className = 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-100 rounded-full flex items-center justify-center';
                          icon.innerHTML = `<span class="text-2xl sm:text-3xl font-bold text-blue-600">${company.name.charAt(0)}</span>`;
                          parent.appendChild(icon);
                        }
                      }}
                    />
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 text-center">
                      {company.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-sm sm:text-base text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-pulse" />
              <span className="font-medium">Enterprise Solutions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-pulse" />
              <span className="font-medium">Flexible Plans</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-pulse" />
              <span className="font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
