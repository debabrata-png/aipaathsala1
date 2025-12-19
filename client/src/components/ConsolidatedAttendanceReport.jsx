import React, { useState } from 'react';
import axios from 'axios';

const ConsolidatedAttendanceReport = () => {
  const [filters, setFilters] = useState({
    type: 'regular',
    coursecode: '',
    regno: '',
    from: '',
    to: '',
    semester: '',
    year: '',
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setData([]);
    try {
      const response = await axios.get(`/api/v2/reports/${filters.type}/attendance/consolidated`, {
        params: filters,
      });
      setData(response.data.data);
    } catch (err) {
      setError('Failed to generate report.');
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Consolidated Attendance Report</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Report Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="regular">Regular</option>
            <option value="advance">Advance</option>
            <option value="remedial">Remedial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Course Code</label>
          <input
            type="text"
            name="coursecode"
            value={filters.coursecode}
            onChange={handleFilterChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Student Registration No.</label>
          <input
            type="text"
            name="regno"
            value={filters.regno}
            onChange={handleFilterChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">From Date</label>
          <input
            type="date"
            name="from"
            value={filters.from}
            onChange={handleFilterChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To Date</label>
          <input
            type="date"
            name="to"
            value={filters.to}
            onChange={handleFilterChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Semester</label>
          <input
            type="text"
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <input
            type="text"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      <button
        onClick={generateReport}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Generating...' : 'Generate Report'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">Report Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.regno}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.present}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.absent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.percent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedAttendanceReport;
