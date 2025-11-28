"use client";

import { use, useState } from "react";
import {
  Card,
  Button,
  Tag,
  Descriptions,
  Spin,
  Statistic,
  Row,
  Col,
  Progress,
  Modal,
  Table,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEditOutlined,
  Fa6SolidArrowLeftLong,
  AntDesignPlusCircleOutlined,
  AntDesignDeleteOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseById } from "@/services/course.api";
import {
  getPaginatedSyllabus,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
  type Syllabus,
} from "@/services/syllabus.api";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { toast } from "react-toastify";
import { AddSyllabusForm, AddSyllabusSchema } from "@/schema/addsyllabus";
import { EditSyllabusForm, EditSyllabusSchema } from "@/schema/editsyllabus";
import { TextInput } from "@/components/form/inputfields/textinput";
import { MultiSelect } from "@/components/form/inputfields/multiselect";
import { TaxtAreaInput } from "@/components/form/inputfields/textareainput";

const CourseDetailPage = ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const router = useRouter();
  const { courseId: courseIdStr } = use(params);
  const courseId = parseInt(courseIdStr);

  const { data: courseResponse, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });

  const courseData = courseResponse?.data?.getCourseById;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "green",
      INACTIVE: "red",
      UPCOMING: "blue",
      ARCHIVED: "default",
    };
    return colors[status] || "default";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BEGINNER: "blue",
      INTERMEDIATE: "orange",
      ADVANCED: "purple",
      REFRESHER: "cyan",
    };
    return colors[type] || "default";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card>
          <p className="text-center text-gray-500">Course not found</p>
        </Card>
      </div>
    );
  }

  const totalDurationDays = Math.ceil(
    (courseData.courseDays * courseData.minsPerDay) / 60
  );
  const progressPercentage =
    (courseData.sessionsCompleted / courseData.courseDays) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<Fa6SolidArrowLeftLong className="text-lg" />}
                size="large"
                onClick={() => router.push("/mtadmin/course")}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseData.courseName}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {courseData.courseId} •{" "}
                  <Tag
                    color={getTypeColor(courseData.courseType)}
                    className="!text-xs !px-2 !py-0"
                  >
                    {courseData.courseType}
                  </Tag>
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<AntDesignEditOutlined className="text-lg" />}
              size="large"
              onClick={() => router.push(`/mtadmin/course/${courseIdStr}/edit`)}
              className="!bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Edit Course
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Revenue"
                value={courseData.totalRevenue}
                prefix="₹"
                valueStyle={{ color: "#3f8600", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Enrolled Students"
                value={courseData.enrolledStudents}
                valueStyle={{ fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Course Progress"
                value={courseData.sessionsCompleted}
                suffix={`/ ${courseData.courseDays}`}
                valueStyle={{ fontSize: "24px" }}
              />
              <Progress
                percent={Math.round(progressPercentage)}
                size="small"
                className="mt-2"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Course Price"
                value={courseData.price}
                prefix="₹"
                valueStyle={{ fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>
        {/* Course Information */}
        <Card title="Course Information" className="shadow-sm">
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered>
            <Descriptions.Item label="Course ID">
              {courseData.courseId}
            </Descriptions.Item>
            <Descriptions.Item label="Course Name">
              {courseData.courseName}
            </Descriptions.Item>
            <Descriptions.Item label="Course Type">
              <Tag color={getTypeColor(courseData.courseType)}>
                {courseData.courseType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Hours Per Day">
              {courseData.minsPerDay} minutes
            </Descriptions.Item>
            <Descriptions.Item label="Course Days">
              {courseData.courseDays} days
            </Descriptions.Item>
            <Descriptions.Item label="Total Duration">
              {totalDurationDays} days
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              ₹{courseData.price.toLocaleString("en-IN")}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(courseData.status)}>
                {courseData.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {courseData.description}
            </Descriptions.Item>
            {courseData.requirements && (
              <Descriptions.Item label="Requirements" span={3}>
                {courseData.requirements}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
        <div></div>
        {/* Course Syllabus Management */}
        <SyllabusManagement
          courseId={courseId}
          courseDays={courseData.courseDays}
        />
      </div>
    </div>
  );
};

// Syllabus Management Component
const SyllabusManagement = ({
  courseId,
  courseDays,
}: {
  courseId: number;
  courseDays: number;
}) => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<Syllabus | null>(null);

  // Fetch syllabus for this course
  const { data: syllabusResponse, isLoading: syllabusLoading } = useQuery({
    queryKey: ["syllabus", courseId],
    queryFn: () =>
      getPaginatedSyllabus({
        searchPaginationInput: { skip: 0, take: 1000 },
        whereSearchInput: { courseId },
      }),
  });

  const syllabusList = syllabusResponse?.data?.getPaginatedSyllabus?.data || [];

  // Get available days (days that don't have syllabus yet)
  const usedDays = syllabusList.map((s) => s.dayNumber);
  const availableDays = Array.from(
    { length: courseDays },
    (_, i) => i + 1
  ).filter((day) => !usedDays.includes(day));

  // Get day options for edit (current day + available days)
  const getEditDayOptions = (currentDay: number) => {
    return Array.from({ length: courseDays }, (_, i) => i + 1).filter(
      (day) => day === currentDay || !usedDays.includes(day)
    );
  };

  const addMethods = useForm<AddSyllabusForm>({
    resolver: valibotResolver(AddSyllabusSchema),
  });

  const editMethods = useForm<EditSyllabusForm>({
    resolver: valibotResolver(EditSyllabusSchema),
  });

  const createSyllabusMutation = useMutation({
    mutationFn: async (data: AddSyllabusForm) => {
      const syllabusId = `SYL-${courseId}-${data.dayNumber}-${Date.now()}`;
      return await createSyllabus({
        courseId,
        syllabusId,
        dayNumber: parseInt(data.dayNumber),
        title: data.title,
        topics: data.topics,
        objectives: data.objectives,
        practicalActivities: data.practicalActivities,
        assessmentCriteria: data.assessmentCriteria,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      toast.success("Syllabus created successfully!");
      queryClient.invalidateQueries({ queryKey: ["syllabus", courseId] });
      setIsAddModalOpen(false);
      addMethods.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create syllabus");
    },
  });

  const updateSyllabusMutation = useMutation({
    mutationFn: async (data: EditSyllabusForm) => {
      if (!editingSyllabus) return;
      return await updateSyllabus({
        id: editingSyllabus.id,
        dayNumber: parseInt(data.dayNumber),
        title: data.title,
        topics: data.topics,
        objectives: data.objectives,
        practicalActivities: data.practicalActivities,
        assessmentCriteria: data.assessmentCriteria,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      toast.success("Syllabus updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["syllabus", courseId] });
      setEditingSyllabus(null);
      editMethods.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update syllabus");
    },
  });

  const deleteSyllabusMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteSyllabus(id);
    },
    onSuccess: () => {
      toast.success("Syllabus deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["syllabus", courseId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete syllabus");
    },
  });

  const handleAddSubmit = (data: AddSyllabusForm) => {
    // Check if day already exists
    if (usedDays.includes(parseInt(data.dayNumber))) {
      toast.error(`Day ${data.dayNumber} already has a syllabus!`);
      return;
    }
    Modal.confirm({
      title: "Add Syllabus",
      content: `Are you sure you want to add syllabus for Day ${data.dayNumber}?`,
      okText: "Yes, Add",
      cancelText: "Cancel",
      onOk: () => createSyllabusMutation.mutate(data),
    });
  };

  const handleEditSubmit = (data: EditSyllabusForm) => {
    if (!editingSyllabus) return;
    // Check if changing to a day that already exists
    if (
      parseInt(data.dayNumber) !== editingSyllabus.dayNumber &&
      usedDays.includes(parseInt(data.dayNumber))
    ) {
      toast.error(`Day ${data.dayNumber} already has a syllabus!`);
      return;
    }
    Modal.confirm({
      title: "Update Syllabus",
      content: `Are you sure you want to update syllabus for Day ${data.dayNumber}?`,
      okText: "Yes, Update",
      cancelText: "Cancel",
      onOk: () => updateSyllabusMutation.mutate(data),
    });
  };

  const handleDelete = (syllabus: Syllabus) => {
    Modal.confirm({
      title: "Delete Syllabus",
      content: `Are you sure you want to delete syllabus for Day ${syllabus.dayNumber}?`,
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => deleteSyllabusMutation.mutate(syllabus.id),
    });
  };

  const handleEdit = (syllabus: Syllabus) => {
    setEditingSyllabus(syllabus);
    editMethods.reset({
      dayNumber: syllabus.dayNumber.toString(),
      title: syllabus.title,
      topics: syllabus.topics,
      objectives: syllabus.objectives || "",
      practicalActivities: syllabus.practicalActivities || "",
      assessmentCriteria: syllabus.assessmentCriteria || "",
      notes: syllabus.notes || "",
    });
  };

  const columns: ColumnsType<Syllabus> = [
    {
      title: "Day",
      dataIndex: "dayNumber",
      key: "dayNumber",
      width: 100,
      sorter: (a, b) => a.dayNumber - b.dayNumber,
      render: (day) => (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
            {day}
          </span>
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text) => <span className="font-semibold text-base">{text}</span>,
    },
    {
      title: "Topics Overview",
      dataIndex: "topics",
      key: "topics",
      ellipsis: true,
      render: (topics) => (
        <span className="text-gray-600">{topics.substring(0, 150)}...</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<AntDesignEditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<AntDesignDeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: Syllabus) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg space-y-4 border-l-4 border-blue-500">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span className="text-blue-600">📋</span> Full Topics:
        </h4>
        <p className="text-gray-700 leading-relaxed">{record.topics}</p>
      </div>

      {record.objectives && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <span className="text-green-600">🎯</span> Learning Objectives:
          </h4>
          <p className="text-gray-700 leading-relaxed">{record.objectives}</p>
        </div>
      )}

      {record.practicalActivities && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <span className="text-purple-600">🛠️</span> Practical Activities:
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {record.practicalActivities}
          </p>
        </div>
      )}

      {record.assessmentCriteria && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <span className="text-orange-600">✅</span> Assessment Criteria:
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {record.assessmentCriteria}
          </p>
        </div>
      )}

      {record.notes && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-gray-600">📝</span> Notes:
          </h4>
          <p className="text-gray-700 leading-relaxed">{record.notes}</p>
        </div>
      )}
    </div>
  );

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-semibold">Course Syllabus</span>
            <Tag
              color={
                syllabusList.length === courseDays ? "success" : "processing"
              }
              className="text-sm px-3 py-1"
            >
              {syllabusList.length}/{courseDays} Days Completed
            </Tag>
          </div>
          <Button
            type="primary"
            icon={<AntDesignPlusCircleOutlined />}
            onClick={() => {
              setIsAddModalOpen(true);
              // Reset form with first available day
              addMethods.reset({
                dayNumber:
                  availableDays.length > 0 ? availableDays[0].toString() : "1",
                title: "",
                topics: "",
                objectives: "",
                practicalActivities: "",
                assessmentCriteria: "",
                notes: "",
              });
            }}
            disabled={availableDays.length === 0}
            className="!bg-gradient-to-r from-green-600 to-teal-600"
          >
            Add Syllabus
          </Button>
        </div>
      }
      className="shadow-sm"
    >
      {/* Progress Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Syllabus Progress
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {((syllabusList.length / courseDays) * 100).toFixed(0)}% Complete
          </span>
        </div>
        <Progress
          percent={(syllabusList.length / courseDays) * 100}
          strokeColor={{
            "0%": "#3b82f6",
            "100%": "#8b5cf6",
          }}
          showInfo={false}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-600">
            {syllabusList.length} of {courseDays} days completed
          </span>
          {availableDays.length > 0 && (
            <span className="text-xs text-orange-600 font-medium">
              {availableDays.length} days remaining
            </span>
          )}
          {availableDays.length === 0 && (
            <span className="text-xs text-green-600 font-medium">
              ✓ All days completed
            </span>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={syllabusList}
        loading={syllabusLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) =>
            !!(
              record.objectives ||
              record.practicalActivities ||
              record.assessmentCriteria ||
              record.notes
            ),
        }}
      />

      {/* Add Syllabus Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            <span className="text-2xl">📚</span>
            <span>Add New Syllabus</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addMethods.reset();
        }}
        footer={null}
        width={800}
      >
        <FormProvider {...addMethods}>
          <form
            onSubmit={addMethods.handleSubmit(handleAddSubmit, onFormError)}
          >
            <div className="space-y-4 mt-4">
              <MultiSelect<AddSyllabusForm>
                name="dayNumber"
                title="Select Day"
                placeholder="Select a day"
                required={true}
                options={availableDays.map((day) => ({
                  label: `Day ${day}`,
                  value: day.toString(),
                }))}
              />
              {availableDays.length === 0 && (
                <div className="text-red-500 text-sm -mt-2">
                  All days have syllabus created. Edit or delete existing
                  syllabus to add new ones.
                </div>
              )}
              <TextInput<AddSyllabusForm>
                name="title"
                title="Lesson Title"
                placeholder="e.g., Introduction to Traffic Rules"
                required
              />
              <TaxtAreaInput<AddSyllabusForm>
                name="topics"
                title="Topics (Required)"
                placeholder="Enter the topics covered in this lesson"
                required
              />
              <TaxtAreaInput<AddSyllabusForm>
                name="objectives"
                title="Learning Objectives (Optional)"
                placeholder="Enter the learning objectives"
                required={false}
              />
              <TaxtAreaInput<AddSyllabusForm>
                name="practicalActivities"
                title="Practical Activities (Optional)"
                placeholder="Enter practical activities"
                required={false}
              />
              <TaxtAreaInput<AddSyllabusForm>
                name="assessmentCriteria"
                title="Assessment Criteria (Optional)"
                placeholder="Enter assessment criteria"
                required={false}
              />
              <TaxtAreaInput<AddSyllabusForm>
                name="notes"
                title="Notes (Optional)"
                placeholder="Enter any additional notes"
                required={false}
              />
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <Button
                size="large"
                onClick={() => {
                  setIsAddModalOpen(false);
                  addMethods.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={createSyllabusMutation.isPending}
                className="!bg-gradient-to-r from-green-600 to-teal-600 hover:!from-green-700 hover:!to-teal-700"
                icon={<AntDesignPlusCircleOutlined />}
              >
                Add Syllabus
              </Button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      {/* Edit Syllabus Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            <span className="text-2xl">✏️</span>
            <span>Edit Syllabus - Day {editingSyllabus?.dayNumber}</span>
          </div>
        }
        open={!!editingSyllabus}
        onCancel={() => {
          setEditingSyllabus(null);
          editMethods.reset();
        }}
        footer={null}
        width={800}
      >
        <FormProvider {...editMethods}>
          <form
            onSubmit={editMethods.handleSubmit(handleEditSubmit, onFormError)}
          >
            <div className="space-y-4 mt-4">
              <MultiSelect<EditSyllabusForm>
                name="dayNumber"
                title="Select Day"
                placeholder="Select a day"
                required={true}
                options={getEditDayOptions(editingSyllabus?.dayNumber || 1).map(
                  (day) => ({
                    label: `Day ${day}`,
                    value: day.toString(),
                  })
                )}
              />
              <TextInput<EditSyllabusForm>
                name="title"
                title="Lesson Title"
                placeholder="e.g., Introduction to Traffic Rules"
                required
              />
              <TaxtAreaInput<EditSyllabusForm>
                name="topics"
                title="Topics (Required)"
                placeholder="Enter the topics covered in this lesson"
                required
              />
              <TaxtAreaInput<EditSyllabusForm>
                name="objectives"
                title="Learning Objectives (Optional)"
                placeholder="Enter the learning objectives"
                required={false}
              />
              <TaxtAreaInput<EditSyllabusForm>
                name="practicalActivities"
                title="Practical Activities (Optional)"
                placeholder="Enter practical activities"
                required={false}
              />
              <TaxtAreaInput<EditSyllabusForm>
                name="assessmentCriteria"
                title="Assessment Criteria (Optional)"
                placeholder="Enter assessment criteria"
                required={false}
              />
              <TaxtAreaInput<EditSyllabusForm>
                name="notes"
                title="Notes (Optional)"
                placeholder="Enter any additional notes"
                required={false}
              />
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <Button
                size="large"
                onClick={() => {
                  setEditingSyllabus(null);
                  editMethods.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={updateSyllabusMutation.isPending}
                className="!bg-gradient-to-r from-blue-600 to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700"
                icon={<AntDesignEditOutlined />}
              >
                Update Syllabus
              </Button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </Card>
  );
};

export default CourseDetailPage;
