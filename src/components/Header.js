import logo from "../logo.svg";

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="Лого Место" className="header__logo" />
      <button className="header__login">Регистрация</button>
    </header>
  );
}
export default Header;
