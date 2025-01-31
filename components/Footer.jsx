const Footer = () => {

  return (

    <div>
      <footer className="footer footer-center bg-navy text-base-content flex justify-center items-center p-4">
        <img src="/Logo.png" alt="Logo" width="170" height="100" className="mx-4" />
        <div className="w-[2px] h-[100px] bg-white mx-4"></div>
        {/* className="grid content-start text-center" */}
        {/* className="flex flex-col items-start" */}
        <div className="flex flex-col items-start">
          <p className="text-base-100">Walailak University</p>
          <p className="text-base-100">Innovation of Medical Informatics</p>
          <p className="text-base-100">
            Copyright © {new Date().getFullYear()} - All rights reserved by BookLab
          </p>
        </div>
      </footer>
    </div>


  )

}

export default Footer