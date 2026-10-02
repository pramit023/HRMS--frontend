import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Tabs,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { employeeApi, departmentApi } from '../../api/endpoints';

const { Option } = Select;

const EmployeeModal = ({ open, onClose, employee, onSuccess }) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentApi.getAll();
        if (res?.data) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveTab('1');
    }
    if (employee) {
      form.setFieldsValue({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        gender: employee.gender,
        dateOfBirth: employee.dateOfBirth ? dayjs(employee.dateOfBirth) : null,
        department: employee.department?._id || employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate ? dayjs(employee.joiningDate) : null,
        salary: employee.salary,
        status: employee.status || 'Active',
        role: employee.user?.role || 'Employee',
        street: employee.address?.street,
        city: employee.address?.city,
        state: employee.address?.state,
        zipCode: employee.address?.zipCode,
        country: employee.address?.country || 'USA',
        emergencyName: employee.emergencyContact?.name,
        emergencyRel: employee.emergencyContact?.relationship,
        emergencyPhone: employee.emergencyContact?.phone,
        bankName: employee.bankDetails?.bankName,
        accountName: employee.bankDetails?.accountName,
        accountNumber: employee.bankDetails?.accountNumber,
        routingOrIfsc: employee.bankDetails?.routingOrIfsc,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        employeeId: '',
        status: 'Active',
        role: 'Employee',
        gender: 'Male',
        country: 'USA',
        joiningDate: dayjs(),
        dateOfBirth: dayjs().subtract(25, 'year'),
        designation: 'Team Member',
        salary: 60000,
        department: departments.length > 0 ? departments[0]._id : 'auto',
      });
    }
  }, [employee, open, form, departments]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        employeeId: values.employeeId || 'auto',
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
        department: values.department,
        designation: values.designation,
        joiningDate: values.joiningDate ? values.joiningDate.toISOString() : undefined,
        salary: values.salary,
        status: values.status,
        role: values.role,
        address: {
          street: values.street || '',
          city: values.city || '',
          state: values.state || '',
          zipCode: values.zipCode || '',
          country: values.country || 'USA',
        },
        emergencyContact: {
          name: values.emergencyName || '',
          relationship: values.emergencyRel || '',
          phone: values.emergencyPhone || '',
        },
        bankDetails: {
          bankName: values.bankName || '',
          accountName: values.accountName || '',
          accountNumber: values.accountNumber || '',
          routingOrIfsc: values.routingOrIfsc || '',
        },
      };

      if (employee) {
        await employeeApi.update(employee._id, payload);
        message.success('Employee updated successfully');
      } else {
        const res = await employeeApi.create(payload);
        const empData = res?.data?.employee || res?.data;
        const tempPwd = res?.data?.temporaryPassword;

        if (tempPwd) {
          Modal.success({
            title: 'Employee Onboarded & Credentials Dispatched!',
            width: 520,
            content: (
              <div style={{ marginTop: 12 }}>
                <p>Employee profile created with secure credentials:</p>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 14, borderRadius: 8, margin: '14px 0' }}>
                  <div style={{ marginBottom: 6 }}><strong>Employee ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{empData?.employeeId}</span></div>
                  <div style={{ marginBottom: 6 }}><strong>Login Email:</strong> <span style={{ fontFamily: 'monospace' }}>{empData?.email}</span></div>
                  <div><strong>Temporary Password:</strong> <code style={{ color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold', fontSize: 14 }}>{tempPwd}</code></div>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  A professional onboarding email containing these credentials and login instructions has been dispatched via Nodemailer. The employee will be forced to change this password on their first login.
                </p>
              </div>
            ),
          });
        } else {
          message.success('Employee created successfully');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err.errorFields && err.errorFields.length > 0) {
        const firstField = err.errorFields[0].name[0];
        if (['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth'].includes(firstField)) {
          setActiveTab('1');
        } else if (['department', 'designation', 'joiningDate', 'salary', 'status', 'role'].includes(firstField)) {
          setActiveTab('2');
        } else {
          setActiveTab('3');
        }
      }
      message.error(err.message || 'Please check the form fields');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: 'Personal Information',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="employeeId"
              label="Employee ID (Leave blank to auto-generate)"
            >
              <Input placeholder="Auto-generated (EMP0001, EMP0002...)" disabled={!!employee} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Non-Binary">Non-Binary</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input placeholder="e.g. Jane" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input placeholder="e.g. Doe" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Work Email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input placeholder="name@enterprisehrms.com" disabled={!!employee} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Phone is required' }]}
            >
              <Input placeholder="+1 (555) 000-0000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[{ required: true, message: 'Date of birth is required' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password"
              label={
                employee ? (
                  'Reset Login Password'
                ) : (
                  <span>
                    Temporary Password{' '}
                    <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: 12 }}>
                      (Optional)
                    </span>
                  </span>
                )
              }
              tooltip="Leave empty to automatically generate a secure temporary password. Or type your desired password (e.g. Emp123!)."
              extra={
                employee
                  ? 'Leave blank to keep existing password.'
                  : 'Leave blank to auto-generate a secure temporary password.'
              }
            >
              <Input.Password
                placeholder={
                  employee
                    ? 'Enter new password to reset'
                    : 'e.g. Emp123! (or leave blank to auto-generate)'
                }
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: 'Job & Compensation',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="department"
              label="Department"
            >
              <Select placeholder="Assign Department">
                {departments.length === 0 ? (
                  <Option value="auto">General Operations (Auto-create)</Option>
                ) : (
                  departments.map((d) => (
                    <Option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </Option>
                  ))
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="designation"
              label="Designation / Title"
              rules={[{ required: true, message: 'Designation is required' }]}
            >
              <Input placeholder="e.g. Senior Software Engineer" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="joiningDate"
              label="Joining Date"
              rules={[{ required: true, message: 'Joining date is required' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="salary"
              label="Annual Base Salary ($)"
              rules={[{ required: true, message: 'Salary is required' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                placeholder="100000"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Employment Status">
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="On Leave">On Leave</Option>
                <Option value="Terminated">Terminated</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="role" label="System Access Role">
              <Select>
                <Option value="Employee">Employee</Option>
                <Option value="Manager">Manager</Option>
                <Option value="HR Admin">HR Admin</Option>
                <Option value="HR Manager">HR Manager</Option>
                <Option value="Super Admin">Super Admin</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: '3',
      label: 'Address & Banking',
      children: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="street" label="Street Address">
              <Input placeholder="100 Enterprise Way" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="city" label="City">
              <Input placeholder="San Francisco" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="state" label="State/Province">
              <Input placeholder="CA" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="zipCode" label="Postal Code">
              <Input placeholder="94105" />
            </Form.Item>
          </Col>

          <Col span={24}><div style={{ fontWeight: 600, margin: '8px 0 12px 0' }}>Bank Account Information</div></Col>
          <Col span={12}>
            <Form.Item name="bankName" label="Bank Name">
              <Input placeholder="e.g. JPMorgan Chase" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="accountName" label="Account Holder Name">
              <Input placeholder="e.g. Jane Doe" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="accountNumber" label="Account Number">
              <Input placeholder="••••••••9876" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="routingOrIfsc" label="Routing / IFSC Code">
              <Input placeholder="e.g. CHASE0001" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Modal
      title={employee ? `Edit Employee: ${employee.fullName}` : 'Add New Enterprise Employee'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={720}
      okText={employee ? 'Save Changes' : 'Create Employee'}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} destroyInactiveTabPane={false} />
      </Form>
    </Modal>
  );
};

export default EmployeeModal;
