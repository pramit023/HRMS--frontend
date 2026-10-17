import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Input,
  Select,
  Space,
  Modal,
  Button,
  message,
} from 'antd';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { auditApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';

const { Text } = Typography;
const { Option } = Select;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.getLogs({
        page,
        limit: 15,
        search,
        module: moduleFilter,
      });
      if (res?.data) {
        setLogs(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (t) => new Date(t).toLocaleString(),
    },
    {
      title: 'Action Code',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        let badgeClass = 'badge-blue';
        if (action.includes('CREATE') || action.includes('SUCCESS') || action.includes('APPROV')) {
          badgeClass = 'badge-active';
        } else if (action.includes('DELETE') || action.includes('REJECT')) {
          badgeClass = 'badge-rejected';
        } else if (action.includes('UPDATE') || action.includes('OVERRIDE')) {
          badgeClass = 'badge-pending';
        }
        return <span className={badgeClass}>{action}</span>;
      },
    },
    {
      title: 'Target Module',
      dataIndex: 'module',
      key: 'module',
      render: (m) => <span className="badge-purple">{m}</span>,
    },
    {
      title: 'Actor Name',
      dataIndex: 'userName',
      key: 'userName',
      render: (name, record) => (
        <div>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <div style={{ fontSize: 11, color: '#64748b' }}>{record.userRole}</div>
        </div>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip) => <span className="badge-id">{ip || '127.0.0.1'}</span>,
    },
    {
      title: 'Payload Details',
      key: 'details',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedDetails(record);
            setDetailsModalOpen(true);
          }}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Security & Audit Trail"
        subtitle="Immutable event log for compliance, role actions, salary adjustments, and administrative overrides"
      />

      {/* Filter Card */}
      <Card className="glass-card" bodyStyle={{ padding: 16 }}>
        <div className="filter-bar-responsive">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search by actor name or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ minWidth: 240, flex: '1 1 240px' }}
          />

          <Select
            placeholder="All Modules"
            value={moduleFilter || undefined}
            onChange={(v) => {
              setModuleFilter(v);
              setPage(1);
            }}
            allowClear
            style={{ minWidth: 160, flex: '1 1 160px' }}
          >
            {[
              'Auth',
              'Employee',
              'Department',
              'Attendance',
              'Leave',
              'Payroll',
              'Performance',
              'Settings',
              'System',
            ].map((m) => (
              <Option key={m} value={m}>
                {m}
              </Option>
            ))}
          </Select>

          <Button type="primary" onClick={handleSearch} style={{ minWidth: 100 }}>
            Filter Logs
          </Button>
        </div>
      </Card>

      {/* Audit Table */}
      <Card className="glass-card">
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 750 }}
          pagination={{
            current: page,
            pageSize: 15,
            total,
            onChange: (p) => setPage(p),
          }}
          locale={{ emptyText: 'No audit records match query' }}
        />
      </Card>

      {/* Inspect Details Modal */}
      <Modal
        title={`Audit Event: ${selectedDetails?.action}`}
        open={detailsModalOpen}
        onCancel={() => setDetailsModalOpen(false)}
        width="min(560px, calc(100vw - 24px))"
        footer={[
          <Button key="ok" type="primary" onClick={() => setDetailsModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedDetails && (
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Module:</strong> <Tag color="purple">{selectedDetails.module}</Tag>
              <strong style={{ marginLeft: 12 }}>Actor:</strong> {selectedDetails.userName} ({selectedDetails.userRole})
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Timestamp:</strong> {new Date(selectedDetails.createdAt).toLocaleString()}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>IP / Client:</strong> {selectedDetails.ipAddress}
            </div>

            <div style={{ fontWeight: 600, marginBottom: 6 }}>Action Payload:</div>
            <pre
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                maxHeight: 250,
                overflowY: 'auto',
              }}
            >
              {JSON.stringify(selectedDetails.details || {}, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
