import { PAGE_CONTENT } from '../constants';
import { BiCheckCircle } from 'react-icons/bi';

interface SuccessMessageProps {
  onReset: () => void;
}

export const SuccessMessage = ({ onReset }: SuccessMessageProps) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <BiCheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{PAGE_CONTENT.SUCCESS_TITLE}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {PAGE_CONTENT.SUCCESS_MESSAGE}
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {PAGE_CONTENT.SUCCESS_BUTTON}
      </button>
    </div>
  );
} 