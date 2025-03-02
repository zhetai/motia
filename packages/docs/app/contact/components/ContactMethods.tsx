import { CONTACT_INFO } from '../constants';
import { MdEmail, MdMenuBook } from 'react-icons/md';
import { FaDiscord } from "react-icons/fa";


interface ContactMethodProps {
  icon: React.ReactNode;
  title: string;
  link: string;
  linkText: string;
}

const ContactMethod = ({ icon, title, link, linkText }: ContactMethodProps) => {
  return (
    <div className="text-center p-6 rounded-lg backdrop-blur-sm border border-[rgba(255,255,255,0.21)] hover:border-purple-700/40">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">
        <a href={link} className="hover:text-blue-400 transition-colors" target={link.startsWith('http') ? "_blank" : undefined} rel={link.startsWith('http') ? "noopener noreferrer" : undefined}>
          {linkText}
        </a>
      </p>
    </div>
  );
}

export const ContactMethods = () => {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
      <ContactMethod
        icon={<MdEmail className="w-6 h-6 text-blue-600" />}
        title={CONTACT_INFO.EMAIL.title}
        link={`mailto:${CONTACT_INFO.EMAIL.address}`}
        linkText={CONTACT_INFO.EMAIL.linkText}
      />
      <ContactMethod
        icon={<FaDiscord className="w-6 h-6 text-blue-600" />}
        title={CONTACT_INFO.DISCORD.title}
        link={CONTACT_INFO.DISCORD.url}
        linkText={CONTACT_INFO.DISCORD.linkText}
      />
      <ContactMethod
        icon={<MdMenuBook className="w-6 h-6 text-blue-600" />}
        title={CONTACT_INFO.DOCS.title}
        link={CONTACT_INFO.DOCS.url}
        linkText={CONTACT_INFO.DOCS.linkText}
      />
    </div>
  );
} 