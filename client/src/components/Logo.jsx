import GithubIcon from "./icons/Github";

function Logo() {
  return (
    <div className="flex items-center text-primary space-x-4">
      <img src="/logo.png" alt="logo" className="h-14 my-2" />
      <div>
        <h1 className="text-[1.6rem] sm:text-[2.1rem] leading-[2.95rem] -mt-[8px]">
          Hot potato
        </h1>
        <a
          href="https://github.com/MxGutierrez/hot-potato"
          target="__blank"
          className="flex items-center space-x-2 text-black hover:text-gray-600"
        >
          <GithubIcon className="h-4 w-4" />
          <span className="text-xs">MxGutierrez/hot-potato</span>
        </a>
      </div>
    </div>
  );
}

export default Logo;
