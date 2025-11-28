"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Button, Avatar, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  FluentMdl2ViewDashboard,
  IcBaselineCalendarMonth,
  AntDesignPlusCircleOutlined,
  AntDesignEditOutlined,
  Fa6RegularCalendarXmark,
  MaterialSymbolsLogout,
  MaterialSymbolsPersonRounded,
  MaterialSymbolsKeyboardDoubleArrowLeft,
  MaterialSymbolsKeyboardDoubleArrowRight,
  IcBaselineAccountCircle,
} from "@/components/icons";
import { deleteCookie, getCookie } from "cookies-next";
import { getSchoolById } from "@/services/school.api";

const { Sider, Content } = Layout;

const baseMenuItems = [
  {
    key: "/mtadmin/dashboard",
    icon: <FluentMdl2ViewDashboard className="text-lg" />,
    label: "Dashboard",
    requiresProfile: false,
  },
  {
    key: "/mtadmin/scheduler",
    icon: <IcBaselineCalendarMonth className="text-lg" />,
    label: "Scheduler",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/booking",
    icon: <AntDesignPlusCircleOutlined className="text-lg" />,
    label: "New Booking",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/bookinglist",
    icon: <IcBaselineCalendarMonth className="text-lg" />,
    label: "Booking List",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/servicebookinglist",
    icon: <span className="text-lg">🎫</span>,
    label: "Service Booking List",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/amendment",
    icon: <AntDesignEditOutlined className="text-lg" />,
    label: "Amendments",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/user",
    icon: <MaterialSymbolsPersonRounded className="text-lg" />,
    label: "Users",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/driver",
    icon: <span className="text-lg">🚘</span>,
    label: "Drivers",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/course",
    icon: <span className="text-lg">📚</span>,
    label: "Courses",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/car",
    icon: <span className="text-lg">🚗</span>,
    label: "Cars",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/holiday",
    icon: <Fa6RegularCalendarXmark className="text-lg" />,
    label: "Holidays",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/service",
    icon: <span className="text-lg">🎫</span>,
    label: "Services & Add-ons",
    requiresProfile: true,
  },
  {
    key: "/mtadmin/profile",
    icon: <span className="text-lg">🏫</span>,
    label: "School Profile",
    requiresProfile: false,
  },
];

export default function MtAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Check profile completion on mount
  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const response = await getSchoolById(schoolId);

        if (response.status && response.data.getSchoolById) {
          const school = response.data.getSchoolById;

          // Check required fields for profile completion
          const requiredFields = [
            "dayStartTime",
            "dayEndTime",
            "ownerName",
            "bankName",
            "accountNumber",
            "ifscCode",
            "rtoLicenseNumber",
          ];

          const isComplete = requiredFields.every(
            (field) => school[field as keyof typeof school]
          );
          setProfileComplete(isComplete);
        }
      } catch (error) {
        console.error("Error checking profile completion:", error);
      }
    };

    checkProfileCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create menu items with disabled state
  const menuItems = baseMenuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label:
      item.requiresProfile && !profileComplete ? (
        <Tooltip
          title="Complete your school profile to access this feature"
          placement="right"
        >
          <span>{item.label}</span>
        </Tooltip>
      ) : (
        item.label
      ),
    disabled: item.requiresProfile && !profileComplete,
  }));

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
          <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            {!collapsed ? (
              <h1 className="text-white text-xl font-bold tracking-wider">
                iDrive School
              </h1>
            ) : (
              <h1 className="text-white text-2xl font-bold">iD</h1>
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium text-sm truncate">
                      Admin User
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      admin@idrive.com
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
