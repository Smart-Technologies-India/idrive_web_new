"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Button, Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  FluentMdl2ViewDashboard,
  MaterialSymbolsLogout,
  MaterialSymbolsPersonRounded,
  MaterialSymbolsKeyboardDoubleArrowLeft,
  MaterialSymbolsKeyboardDoubleArrowRight,
  IcBaselineAccountCircle,
} from "@/components/icons";
import { deleteCookie } from "cookies-next";

const { Sider, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  {
    key: "/admin",
    icon: <FluentMdl2ViewDashboard className="text-lg" />,
    label: "Dashboard",
  },
  {
    key: "/admin/school",
    icon: <span className="text-lg">🏫</span>,
    label: "Schools",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    router.push(e.key);
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <MaterialSymbolsPersonRounded className="text-lg" />,
      label: "Profile",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <MaterialSymbolsLogout className="text-lg" />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "logout") {
      deleteCookie("id");
      deleteCookie("role");
      router.push("/adminlogin");
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
        width={260}
        className="!bg-white shadow-lg border-r border-gray-200"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600">
            {!collapsed ? (
              <h1 className="text-white text-xl font-bold tracking-wider">
                iDrive Super Admin
              </h1>
            ) : (
              <h1 className="text-white text-2xl font-bold">SA</h1>
            )}
          </div>

          {/* Menu */}
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            onClick={handleMenuClick}
            className="!bg-white border-0 flex-1 py-4"
            items={menuItems}
            style={{
              fontSize: "15px",
            }}
          />

          {/* Collapse Button */}
          <div className="p-3 border-t border-gray-200">
            <Button
              type="text"
              icon={
                collapsed ? (
                  <MaterialSymbolsKeyboardDoubleArrowRight className="text-gray-600 text-xl" />
                ) : (
                  <MaterialSymbolsKeyboardDoubleArrowLeft className="text-gray-600 text-xl" />
                )
              }
              onClick={() => setCollapsed(!collapsed)}
              className="w-full !text-gray-600 hover:!bg-gray-100 flex items-center justify-center"
            >
              {!collapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>

          {/* User Info */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              trigger={["click"]}
              placement="topRight"
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-all">
                <Avatar
                  size={collapsed ? 32 : 40}
                  icon={<IcBaselineAccountCircle />}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600"
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium text-sm truncate">
                      Super Admin
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      superadmin@idrive.com
                    </p>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: "margin-left 0.2s",
        }}
      >
        <Content className="min-h-screen bg-gray-100">{children}</Content>
      </Layout>
    </Layout>
  );
}
