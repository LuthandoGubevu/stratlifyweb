
import { Button } from '@/components/ui/button';
import { ApexdevNavbar } from '@/components/ApexdevNavbar';
import Link from 'next/link';
import Image from 'next/image';
import { Palette, Code, MonitorSmartphone, Film, Share2, Award, Phone, Mail } from 'lucide-react';

const services = [
  { name: "Graphic Design", icon: <Palette className="w-10 h-10 text-cyan-500" />, description: "Crafting visually stunning designs that tell your brand's story and captivate your audience.", imageHint: "graphic design abstract" },
  { name: "Web Development", icon: <Code className="w-10 h-10 text-cyan-500" />, description: "Building robust, scalable, and high-performance websites and web applications tailored to your needs.", imageHint: "code screen" },
  { name: "Web Design", icon: <MonitorSmartphone className="w-10 h-10 text-cyan-500" />, description: "Creating intuitive, user-friendly, and responsive web interfaces that drive engagement.", imageHint: "website mockup" },
  { name: "Multimedia Production", icon: <Film className="w-10 h-10 text-cyan-500" />, description: "Producing engaging video content, animations, and interactive media to elevate your message.", imageHint: "video editing" },
  { name: "Social Media Strategy", icon: <Share2 className="w-10 h-10 text-cyan-500" />, description: "Developing data-driven social media campaigns to grow your online presence and connect with customers.", imageHint: "social media icons" },
  { name: "Branding & Identity", icon: <Award className="w-10 h-10 text-cyan-500" />, description: "Building memorable brand identities, from logo design to complete brand guidelines.", imageHint: "brand moodboard" },
];

export default function ApexDevLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-gray-200 font-body">
      <ApexdevNavbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-48 md:pb-24 text-center bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-white mb-6">
              Unlock Precision Ad Campaigns with Stratlify
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Your all-in-one platform to strategize, build, and perfect ad creatives that deliver results. Step inside and transform your marketing.
            </p>
            <div className="flex justify-center">
              <Button size="lg" asChild className="font-semibold bg-cyan-500 hover:bg-cyan-600 text-black w-full sm:w-auto">
                <Link href="/stratlify-platform">Explore Stratlify</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Who We Are Section */}
        <section id="who-we-are" className="py-16 md:py-24 bg-[#111111]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-headline font-semibold text-white mb-6">Who We Are</h2>
                <p className="text-lg text-gray-300 mb-4">
                  ApexDev Studios is a passionate digital agency based in East London, South Africa. We specialize in creating impactful digital solutions that help businesses thrive.
                </p>
                <p className="text-lg text-gray-300">
                  Our mission is to blend creativity with cutting-edge technology to deliver outstanding results and build long-lasting partnerships with our clients.
                </p>
              </div>
              <div>
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="ApexDev Studios Team or Office" 
                  width={600} 
                  height={400} 
                  className="rounded-lg shadow-xl mx-auto"
                  data-ai-hint="team office" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services-section" className="py-16 md:py-24 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-headline font-semibold text-center text-white mb-12">
              Our Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.name} className="bg-[#222222] p-6 rounded-lg shadow-lg text-center hover:shadow-cyan-500/30 transition-shadow duration-300 flex flex-col items-center">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-headline font-semibold text-white mb-3">{service.name}</h3>
                  <p className="text-gray-400 text-sm flex-grow">{service.description}</p>
                   <div className="mt-4">
                    <Image 
                      src={`https://placehold.co/300x200.png`} 
                      alt={service.name} 
                      width={300} 
                      height={200} 
                      className="rounded-md object-cover aspect-video"
                      data-ai-hint={service.imageHint}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact-section" className="py-16 md:py-24 bg-[#111111]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold text-white mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-300 max-w-xl mx-auto mb-8">
              Ready to start your project or have a question? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-lg">
              <a href="tel:0793258818" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
                <Phone className="mr-2 h-5 w-5" /> 079 325 8818
              </a>
              <a href="mailto:lgubevu@gmail.com" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
                <Mail className="mr-2 h-5 w-5" /> lgubevu@gmail.com
              </a>
            </div>
            <p className="text-gray-400 mt-8 text-sm">Location: East London, South Africa</p>
            {/* Placeholder for contact form or map */}
            <div className="mt-8">
              <Button size="lg" asChild className="font-semibold bg-cyan-500 hover:bg-cyan-600 text-black">
                <a href="mailto:lgubevu@gmail.com">Send Us An Email</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-black border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
           <Link href="/" className="flex items-center justify-center gap-2 text-xl font-headline font-semibold text-white mb-2">
            {/* <Package className="h-6 w-6 text-cyan-500" /> */}
            ApexDev Studios
          </Link>
          <p className="text-sm">&copy; {new Date().getFullYear()} ApexDev Studios. All rights reserved.</p>
          <p className="text-xs mt-1">Designed in East London, South Africa.</p>
        </div>
      </footer>
    </div>
  );
}
