import React from 'react';

const DeveloperComponents: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      {/* Первый кружок (верхний) */}
      <div className="flex flex-col -ml-52 items-center">
        <a href="https://t.me/ggggsmjuw" target="_blank" rel="noopener noreferrer">
          <div className="w-10 h-10 scale-125 hover:scale-150 transition duration-300 z-20 rounded-full border-2 border-[#ffffff] flex items-center justify-center overflow-hidden">
            <img
              src="/images/user.png"
              alt="User"
              className="object-cover"
            />
          </div>
        </a>
      </div>

      {/* Второй кружок (сзади) */}
      <div className="flex flex-col items-center -ml-4">
        <a href="https://t.me/vdumanyan" target="_blank" rel="noopener noreferrer">
          <div className="w-10 h-10  scale-125 hover:scale-150 transition duration-300 z-10 rounded-full border-2 border-[#ffffff] flex items-center justify-center overflow-hidden">
            <img
              src="/images/user.png"
              alt="User"
              className="object-cover"
            />
          </div>
        </a>
      </div>
    </div>
  );
};

export default DeveloperComponents;
