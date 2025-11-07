import NotFoundImage from "@/assets/404.svg";

export const NotFound = () => {
  return (
    <div className="flex justify-center items-center h-dvh bg-background px-4 md:px-0">
      <div className="flex flex-col items-center">
        <img src={NotFoundImage} alt="404 NotFound" className="object-cover bg-no-repeat bg-center h-96" />
        <h4 className="text-primary font-semibold text-xl">Halaman tidak ditemukan.</h4>
      </div>
    </div>
  );
};
