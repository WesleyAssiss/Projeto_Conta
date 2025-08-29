import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/SideMenu.css';

const SideMenu = () => {
  return (
    <nav className="side-menu">
      <h2>Controle Geral</h2>
      <ul>
        <li>
            <NavLink to="/">Dashboard</NavLink>
        </li>
      </ul>
      <hr className="menu-divider" />
      <ul>
        <li>
          <NavLink to="/cemig">CEMIG</NavLink>
        </li>
        <li>
          <NavLink to="/copasa">COPASA</NavLink>
        </li>
      </ul>
      <hr className="menu-divider" />
      <ul>
        <li>
            <NavLink to="/secretarias">Secretarias</NavLink>
        </li>
        <li>
            <NavLink to="/imoveis">Cadastro de Imóveis</NavLink>
        </li>
      </ul>
      <hr className="menu-divider" />
      <ul>
        <li>
            <NavLink to="/relatorios">Relatórios</NavLink>
        </li>
        <li>
            <NavLink to="/importacao">Importação</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default SideMenu;