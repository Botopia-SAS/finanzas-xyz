'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, CreditCard, Settings } from 'lucide-react';
import { LogoutButton } from './logout-button';

const navItems = [
	{ label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
	{ label: 'Perfil', href: '/profile', icon: <User size={20} /> },
	{ label: 'Facturación', href: '/billing', icon: <CreditCard size={20} /> },
	{ label: 'Configuraciones', href: '/materias-primas', icon: <Settings size={20} /> }
];

export default function Sidebar(): React.ReactElement {
	const path = usePathname();

	return (
		<>
			{/* Sidebar lateral para desktop */}
			<aside className="hidden md:flex w-56 h-full bg-white border-r border-gray-200 flex-col justify-between px-4 py-6">
				<div>
					<div className="mb-10 flex items-center space-x-2">
						<div className="h-6 w-6 bg-gradient-to-br from-[#fe8027] to-[#7dd1d6] rounded-sm shadow-sm" />
						<span className="text-lg font-semibold bg-gradient-to-r from-[#152241] to-[#152241] bg-clip-text text-transparent">
							Finanzas XYZ
						</span>
					</div>
					<nav>
						<ul className="space-y-2">
							{navItems.map(item => {
								const isActive = path === item.href;
								return (
									<li key={item.href}>
										<Link
											href={item.href}
											className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group
                        ${isActive
													? 'bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] text-white shadow-lg'
													: 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'}
                      `}
										>
											{item.icon}
											<span className="text-sm font-medium">{item.label}</span>
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>
				</div>
				<div className="mt-10">
					<LogoutButton className="w-full text-sm px-3 py-2 rounded-lg bg-[#152241] text-white hover:bg-[#1a2a52] transition-all duration-200 shadow-lg hover:shadow-xl" />
				</div>
			</aside>

			{/* Bottom nav para mobile */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white border-t border-gray-200 py-3 pb-[env(safe-area-inset-bottom)] shadow-lg">
				{navItems.map(item => {
					const isActive = path === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex flex-col items-center justify-center px-2 py-1 text-xs transition-all duration-200
                ${isActive 
                                    ? 'text-transparent bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] bg-clip-text font-semibold scale-105' 
                                    : 'text-gray-500 hover:text-blue-600'
                                }
              `}
						>
							<div className={isActive ? 'text-blue-600' : ''}>
								{item.icon}
							</div>
							<span className="text-xs mt-1.5">{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</>
	);
}