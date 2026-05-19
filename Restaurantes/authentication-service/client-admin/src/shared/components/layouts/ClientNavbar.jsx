import { Link, NavLink } from 'react-router-dom';
import imgLogo from '../../../assets/img/los_rubios_rojos_logo.svg';

const navItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Restaurantes', to: '/restaurants' },
  { label: 'Reservas', to: '/reservations' },
  { label: 'Órdenes', to: '/orders' },
  { label: 'Login', to: '/login' },
];

export const ClientNavbar = () => {
  return (
    <header className='sticky top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-xl'>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8'>
        <Link to='/' className='flex items-center gap-3'>
          <img src={imgLogo} alt='Los Rubios Rojos' className='h-10 w-auto' />
          <div className='hidden sm:block'>
            <p className='text-sm font-semibold text-main-blue'>Los Rubios Rojos</p>
            <p className='text-xs text-gray-600'>Experiencia cliente</p>
          </div>
        </Link>

        <nav className='hidden gap-2 md:flex'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-main-blue text-white shadow-sm'
                    : 'text-gray-700 hover:bg-surface-soft hover:text-main-blue'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to='/login'
          className='rounded-full border border-main-blue px-4 py-2 text-sm font-semibold text-main-blue transition hover:bg-main-blue hover:text-white'
        >
          Acceso admin
        </Link>
      </div>
    </header>
  );
};