import { Construction } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-[#F7D046] rounded-full flex items-center justify-center shadow-lg">
            <Construction size={48} className="text-[#2C2C2C]" strokeWidth={2} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-[#2C2C2C]">Coming Soon</h1>
          <p className="text-gray-500 text-lg font-sans">
            This feature is currently under development
          </p>
        </div>
        
        <div className="pt-4">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-[#F7D046] text-[#2C2C2C] font-bold rounded-xl hover:bg-[#eac542] transition-colors shadow-md"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
