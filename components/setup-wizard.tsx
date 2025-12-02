"use client";

import { useState, useEffect } from "react";
import { Card, Progress, Button, Steps, Modal } from "antd";
import { useRouter } from "next/navigation";
import {
  CheckCircleOutlined,
  RightOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { SETUP_STEPS, calculateSetupPercentage, getNextStep } from "@/utils/setup-progress";
import type { SetupProgress } from "@/utils/setup-progress";

interface SetupWizardProps {
  progress: SetupProgress;
  onRefresh?: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ progress }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(() => {
    // Initialize modal state based on setup completion
    if (typeof window !== 'undefined') {
      const hasSeenWizard = localStorage.getItem("hasSeenSetupWizard");
      return !hasSeenWizard && !progress.setupComplete && calculateSetupPercentage(progress) < 100;
    }
    return false;
  });

  const percentage = calculateSetupPercentage(progress);
  const nextStep = getNextStep(progress);
  const isSetupComplete = progress.setupComplete;

  useEffect(() => {
    // Mark wizard as seen when modal is first shown
    if (showModal && typeof window !== 'undefined') {
      localStorage.setItem("hasSeenSetupWizard", "true");
    }
  }, [showModal]);

  const stepsWithStatus = SETUP_STEPS.map((step) => {
    let completed = false;
    if (step.key === "profile") completed = progress.profileComplete;
    if (step.key === "drivers") completed = progress.driversAdded;
    if (step.key === "cars") completed = progress.carsAdded;
    if (step.key === "courses") completed = progress.coursesAdded;
    if (step.key === "services") completed = progress.servicesAdded;

    return {
      ...step,
      completed,
    };
  });

  const currentStepIndex = stepsWithStatus.findIndex((s) => !s.completed);

  if (isSetupComplete || percentage === 100) {
    return null; // Don't show wizard if setup is complete
  }

  return (
    <>
      {/* Compact Banner */}
      <Card className="mb-6 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <h3 className="text-lg font-bold text-gray-900">
                Complete Your Setup
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {nextStep
                ? `Next: ${nextStep.title}`
                : "Your school setup is almost complete!"}
            </p>
            <div className="flex items-center gap-3">
              <Progress
                percent={percentage}
                strokeColor={{
                  "0%": "#3b82f6",
                  "100%": "#8b5cf6",
                }}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                {percentage}% Complete
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="large"
              onClick={() => setShowModal(true)}
            >
              View Steps
            </Button>
            {nextStep && (
              <Button
                type="primary"
                size="large"
                icon={<RightOutlined />}
                onClick={() => router.push(nextStep.route)}
              >
                Continue Setup
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Detailed Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <span className="text-3xl">🎯</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                School Setup Guide
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Follow these steps to start accepting bookings
              </p>
            </div>
          </div>
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            Close
          </Button>,
          nextStep && (
            <Button
              key="continue"
              type="primary"
              icon={<RightOutlined />}
              onClick={() => {
                setShowModal(false);
                router.push(nextStep.route);
              }}
            >
              {nextStep.title}
            </Button>
          ),
        ]}
        width={700}
      >
        <div className="py-4">
          <Steps
            direction="vertical"
            current={currentStepIndex}
            items={stepsWithStatus.map((step) => ({
              title: (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="font-semibold">{step.title}</span>
                  {step.completed && (
                    <CheckCircleOutlined className="text-green-600" />
                  )}
                </div>
              ),
              description: (
                <div className="ml-10">
                  <p className="text-gray-600 mb-2">{step.description}</p>
                  {!step.completed && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setShowModal(false);
                        router.push(step.route);
                      }}
                    >
                      Go to {step.title} →
                    </Button>
                  )}
                </div>
              ),
              status: step.completed ? "finish" : "wait",
            }))}
          />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>💡</span> Why this order?
            </h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Drivers must be added before assigning them to cars</li>
              <li>Cars need assigned drivers before creating bookings</li>
              <li>Courses define what services you offer</li>
              <li>All setup must be complete before accepting bookings</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};

interface SetupBlockerProps {
  reason: string;
  nextStep?: {
    title: string;
    route: string;
  };
}

export const SetupBlocker: React.FC<SetupBlockerProps> = ({ reason, nextStep }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center shadow-lg">
        <div className="mb-4">
          <CloseCircleOutlined className="text-6xl text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Setup Required
        </h2>
        <p className="text-gray-600 mb-6">{reason}</p>
        {nextStep && (
          <Button
            type="primary"
            size="large"
            icon={<RightOutlined />}
            onClick={() => router.push(nextStep.route)}
            block
          >
            {nextStep.title}
          </Button>
        )}
        <Button
          type="link"
          onClick={() => router.push("/mtadmin/dashboard")}
          className="mt-3"
        >
          Back to Dashboard
        </Button>
      </Card>
    </div>
  );
};
