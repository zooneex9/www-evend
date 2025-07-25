import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Form, 
  InputGroup, 
  Button, 
  Pagination, 
  Badge,
  Dropdown,
  Card,
  Row,
  Col
} from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  Plus
} from 'lucide-react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  onEdit, 
  onDelete, 
  onView,
  onStats,
  onCreate,
  searchable = true,
  filterable = true,
  pagination = true,
  itemsPerPage = 10,
  title = "Datos",
  loading = false,
  emptyMessage = "No hay datos disponibles"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        result = result.filter(item => 
          String(item[key]).toLowerCase().includes(filters[key].toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = pagination 
    ? filteredData.slice(startIndex, startIndex + itemsPerPage)
    : filteredData;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      pending: 'warning',
      cancelled: 'danger',
      completed: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const ActionDropdown = ({ item }) => (
    <Dropdown>
      <Dropdown.Toggle variant="outline-secondary" size="sm">
        <MoreVertical size={16} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {onView && (
          <Dropdown.Item onClick={() => onView(item)}>
            <Eye size={16} className="me-2" />
            Ver
          </Dropdown.Item>
        )}
        {onStats && (
          <Dropdown.Item onClick={() => onStats(item)}>
            <BarChart3 size={16} className="me-2" />
            Estadísticas
          </Dropdown.Item>
        )}
        {onEdit && (item.role !== undefined ? item.role !== 'suspended' : item.is_active !== false) && (
          <Dropdown.Item onClick={() => onEdit(item)} className="text-warning">
            <Edit size={16} className="me-2" />
            Suspender
          </Dropdown.Item>
        )}
        {onDelete && (
          <Dropdown.Item 
            onClick={() => onDelete(item)}
            className="text-danger"
          >
            <Trash2 size={16} className="me-2" />
            Eliminar
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-transparent border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="fw-semibold mb-0">{title}</h6>
          <div className="d-flex gap-2">
            {onCreate && (
              <Button variant="primary" size="sm" onClick={onCreate}>
                <Plus size={16} className="me-1" />
                Crear
              </Button>
            )}
            <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
              <RefreshCw size={16} className="me-1" />
              Limpiar
            </Button>
            <Button variant="outline-primary" size="sm">
              <Download size={16} className="me-1" />
              Exportar
            </Button>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body className="p-0">
        {/* Search and Filters */}
        {(searchable || filterable) && (
          <div className="p-3 border-bottom">
            <Row className="g-3">
              {searchable && (
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search size={16} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              )}
              
              {filterable && columns.filter(col => col.filterable).map((col, index) => (
                <Col md={3} key={index}>
                  <Form.Control
                    placeholder={`Filtrar ${col.label}...`}
                    value={filters[col.key] || ''}
                    onChange={(e) => handleFilter(col.key, e.target.value)}
                  />
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Table */}
        <div className="table-responsive">
          <Table className="mb-0">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    className={`${column.sortable ? 'cursor-pointer' : ''} ${column.width ? `w-${column.width}` : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="d-flex align-items-center text-white">
                      {column.label}
                      {column.sortable && sortField === column.key && (
                        <span className="ms-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4 text-muted">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <motion.tr
                      key={item.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {columns.map((column, colIndex) => (
                        <td key={colIndex}>
                          {column.render ? (
                            column.render(item[column.key], item)
                          ) : column.type === 'status' ? (
                            getStatusBadge(item[column.key])
                          ) : column.type === 'date' ? (
                            new Date(item[column.key]).toLocaleDateString()
                          ) : column.type === 'currency' ? (
                            `$${Number(item[column.key]).toLocaleString()}`
                          ) : (
                            item[column.key]
                          )}
                        </td>
                      ))}
                      <td className="text-end">
                        <ActionDropdown item={item} />
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top">
            <div className="text-muted">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length} resultados
            </div>
            <Pagination className="mb-0">
              <Pagination.First 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              })}
              
              <Pagination.Next 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DataTable; 