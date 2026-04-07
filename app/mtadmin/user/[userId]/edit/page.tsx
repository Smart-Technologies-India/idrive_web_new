"use client";

import React, { useState, useEffect, use, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Spin,
  Checkbox,
  Upload,
  Avatar,
  message,
  Modal,
} from "antd";
import {
  IcBaselineArrowBack,
  AntDesignCheckOutlined,
  MaterialSymbolsPersonRounded,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getUserById, updateUser } from "@/services/user.api";
import { uploadUserProfile } from "@/services/uploader.api";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { baseurl } from "@/utils/conts";

const { TextArea } = Input;

// Camera Icon Component
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 17.5c-2.33 0-4.32-1.45-5.12-3.5h1.5c.72 1.21 2 2 3.62 2s2.9-.79 3.62-2h1.5c-.8 2.05-2.79 3.5-5.12 3.5M9 11c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m6 0c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m4-4h-3.17L14 5H10L8.17 7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
  </svg>
);

interface UserFormValues {
  name: string;
  surname?: string;
  fatherName?: string;
  email?: string;
  contact1: string;
  contact2?: string;
  address?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  dateOfBirth?: Dayjs;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT" | "DRIVER" | "MTADMIN";
  status: "ACTIVE" | "INACTIVE";
}

const EditUserPage = ({ params }: { params: Promise<{ userId: string }> }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Unwrap params (Next.js 15+ async params)
  const { userId } = use(params);

  // Parse the numeric user ID from the URL parameter
  const numericUserId = parseInt(userId);

  // Handle checkbox change to copy current address to permanent address
  const handleSameAsCurrentAddress = (checked: boolean) => {
    setSameAsCurrentAddress(checked);
    if (checked) {
      const currentAddress = form.getFieldValue("address");
      form.setFieldValue("permanentAddress", currentAddress);
    } else {
      form.setFieldValue("permanentAddress", "");
    }
  };

  // Load existing user data
  useEffect(() => {
    const fetchUserData = async () => {
      setFetching(true);
      try {
        const response = await getUserById(numericUserId);

        if (response.status && response.data.getUserById) {
          const user = response.data.getUserById;
          form.setFieldsValue({
            name: user.name,
            surname: user.surname || "",
            fatherName: user.fatherName || "",
            email: user.email || "",
            contact1: user.contact1,
            contact2: user.contact2 || "",
            address: user.address || "",
            permanentAddress: user.permanentAddress || "",
            bloodGroup: user.bloodGroup || "",
            dateOfBirth: user.dob ? dayjs(user.dob) : undefined,
            role: user.role,
            status: user.status,
          });
          // Set profile photo if exists
          if (user.profile) {
            setProfilePhotoUrl(user.profile);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [form, numericUserId]);

  const handleSubmit = async (values: UserFormValues) => {
    setLoading(true);
    try {
      const response = await updateUser({
        id: numericUserId,
        name: values.name,
        surname: values.surname,
        fatherName: values.fatherName,
        email: values.email || undefined,
        contact1: values.contact1,
        contact2: values.contact2,
        address: values.address,
        permanentAddress: values.permanentAddress,
        bloodGroup: values.bloodGroup,
        dob: values.dateOfBirth?.toDate(),
        role: values.role,
        status: values.status,
        profile: profilePhotoUrl || undefined,
      });

      if (response.status && response.data.updateUser) {
        toast.success("User updated successfully!");
        router.push(`/mtadmin/user/${userId}`);
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    // Validate file type - only allow images
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    // Validate file size - max 1MB
    const isLessThan1MB = file.size / 1024 / 1024 <= 1;
    if (!isLessThan1MB) {
      message.error('Image must be smaller than 1MB!');
      return false;
    }

    setUploading(true);
    try {
      const response = await uploadUserProfile(file);
      if (response.status && response.data) {
        setProfilePhotoUrl(response.data);
        message.success("Photo uploaded successfully!");
      } else {
        message.error(response.message || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      message.error("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload behavior
  };

  const handlePhotoRemove = () => {
    setProfilePhotoUrl("");
    message.success("Photo removed");
  };

  // Open camera and start stream
  const handleOpenCamera = async () => {
    // Check if running on HTTPS or localhost
    const isSecureContext = window.isSecureContext;
    if (!isSecureContext) {
      message.error("Camera access requires HTTPS or localhost. Please use a secure connection.");
      return;
    }

    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      message.error("Your browser doesn't support camera access. Please use a modern browser.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false,
      });
      setStream(mediaStream);
      setCameraModalOpen(true);
      
      // Wait for modal to render then set video stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error: unknown) {
      console.error("Error accessing camera:", error);
      
      // Provide specific error messages based on error type
      const err = error as DOMException;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message.error("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message.error("No camera found. Please connect a camera and try again.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message.error("Camera is already in use by another application. Please close other apps and try again.");
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        message.error("Camera doesn't support the requested settings. Trying with default settings...");
        // Retry with minimal constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setStream(fallbackStream);
          setCameraModalOpen(true);
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
            }
          }, 100);
        } catch (fallbackError) {
          message.error("Failed to access camera with any settings.");
        }
      } else {
        message.error(`Camera error: ${err.message || 'Unknown error occurred'}`);
      }
    }
  };

  // Stop camera stream
  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraModalOpen(false);
  };

  // Capture photo from webcam
  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        message.error('Failed to capture photo');
        return;
      }

      // Create a File object from blob
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Upload the captured photo
      setUploading(true);
      try {
        const response = await uploadUserProfile(file);
        if (response.status && response.data) {
          setProfilePhotoUrl(response.data);
          message.success("Photo captured and uploaded successfully!");
          handleCloseCamera();
        } else {
          message.error(response.message || "Failed to upload photo");
        }
      } catch (error) {
        console.error("Error uploading captured photo:", error);
        message.error("Failed to upload photo. Please try again.");
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push(`/mtadmin/user/${userId}`)}
              size="large"
            >
              Back to User Profile
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Update user information - ID: {userId}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <Card className="shadow-sm max-w-4xl mx-auto">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Personal Information
              </h3>
              
              {/* Profile Photo Upload */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3">
                  <Avatar
                    size={120}
                    icon={<MaterialSymbolsPersonRounded className="text-5xl" />}
                    src={profilePhotoUrl ? `${baseurl}/${profilePhotoUrl}` : undefined}
                    className="border-4 border-gray-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    icon={<CameraIcon />}
                    onClick={handleOpenCamera}
                    disabled={uploading}
                    size="large"
                  >
                    Take Photo
                  </Button>
                  <Upload
                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                    showUploadList={false}
                    beforeUpload={handlePhotoUpload}
                    disabled={uploading}
                    maxCount={1}
                  >
                    <Button loading={uploading} size="large">
                      {profilePhotoUrl ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </Upload>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Max file size: 1MB. Supported formats: JPG, PNG, GIF, WEBP
                </p>
                {profilePhotoUrl && (
                  <Button
                    type="text"
                    danger
                    onClick={handlePhotoRemove}
                    className="mt-2"
                  >
                    Remove Photo
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter name" },
                    {
                      min: 3,
                      message: "Name must be at least 3 characters",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter full name" />
                </Form.Item>

                <Form.Item label="Surname (Optional)" name="surname">
                  <Input size="large" placeholder="Enter surname" />
                </Form.Item>

                <Form.Item label="Father's Name (Optional)" name="fatherName">
                  <Input size="large" placeholder="Enter father's name" />
                </Form.Item>

                <Form.Item
                  label="Email (Optional)"
                  name="email"
                  rules={[
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input size="large" placeholder="Enter email address" />
                </Form.Item>

                <Form.Item
                  label="Primary Contact"
                  name="contact1"
                  rules={[
                    { required: true, message: "Please enter contact number" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Please enter valid 10-digit mobile number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </Form.Item>

                <Form.Item
                  label="Secondary Contact (Optional)"
                  name="contact2"
                  rules={[
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Please enter valid 10-digit mobile number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter 10-digit alternate mobile number"
                    maxLength={10}
                  />
                </Form.Item>

                <Form.Item label="Date of Birth (Optional)" name="dateOfBirth">
                  <DatePicker
                    size="large"
                    className="w-full"
                    placeholder="Select date of birth"
                    format="DD-MM-YYYY"
                    maxDate={dayjs()}
                  />
                </Form.Item>

                <Form.Item label="Blood Group (Optional)" name="bloodGroup">
                  <Select
                    size="large"
                    placeholder="Select blood group"
                    options={[
                      { label: "A+", value: "A+" },
                      { label: "A-", value: "A-" },
                      { label: "B+", value: "B+" },
                      { label: "B-", value: "B-" },
                      { label: "AB+", value: "AB+" },
                      {
                        label: "Unknown",
                        value: "Unknown",
                      },
                      { label: "O+", value: "O+" },
                      { label: "O-", value: "O-" },
                      { label: "AB-", value: "AB-" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Current Address (Optional)"
                  name="address"
                  className="md:col-span-2"
                >
                  <TextArea rows={3} placeholder="Enter current address" />
                </Form.Item>

                <div className="md:col-span-2">
                  <div className="mb-2">
                    <Checkbox
                      checked={sameAsCurrentAddress}
                      onChange={(e) =>
                        handleSameAsCurrentAddress(e.target.checked)
                      }
                    >
                      <span className="text-sm text-gray-700">
                        Same as Current Address
                      </span>
                    </Checkbox>
                  </div>
                  <Form.Item
                    label="Permanent Address (Optional)"
                    name="permanentAddress"
                  >
                    <TextArea rows={3} placeholder="Enter permanent address" />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: "Please select role" }]}
                >
                  <Select
                    size="large"
                    placeholder="Select role"
                    options={[
                      { label: "Admin", value: "ADMIN" },
                      { label: "Instructor", value: "INSTRUCTOR" },
                      { label: "Student", value: "STUDENT" },
                      { label: "Driver", value: "DRIVER" },
                      { label: "MT Admin", value: "MTADMIN" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select
                    size="large"
                    placeholder="Select status"
                    options={[
                      { label: "Active", value: "ACTIVE" },
                      { label: "Inactive", value: "INACTIVE" },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="default"
                size="large"
                onClick={() => router.push(`/mtadmin/user/${userId}`)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<AntDesignCheckOutlined />}
                className="flex-1 !bg-blue-600"
              >
                Update User
              </Button>
            </div>
          </Form>
        </Card>
      </div>

      {/* Camera Modal */}
      <Modal
        title="Take Photo"
        open={cameraModalOpen}
        onCancel={handleCloseCamera}
        footer={[
          <Button key="cancel" onClick={handleCloseCamera}>
            Cancel
          </Button>,
          <Button
            key="capture"
            type="primary"
            onClick={handleCapturePhoto}
            loading={uploading}
            icon={<CameraIcon />}
          >
            Capture Photo
          </Button>,
        ]}
        width={700}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-[640px] h-auto"
              style={{ transform: 'scaleX(-1)' }} // Mirror the video
            />
          </div>
          <p className="text-sm text-gray-500">
            Position yourself in the frame and click &quot;Capture Photo&quot; when ready
          </p>
          {/* Hidden canvas for capturing the photo */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </Modal>
    </div>
  );
};

export default EditUserPage;
