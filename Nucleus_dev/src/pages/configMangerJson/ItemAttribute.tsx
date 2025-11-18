import type { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../slices';
import type { ServiceCharacteristicReadable, NetworkServiceNode } from '../../types/ConfigMangerJsonInterface';
import {
  setTreeData,
} from '../../slices/configManagerJsonSlices/orderContent/reducer';
import {
  setAttributes,
  setFormData,
  setSelectedAttr,
} from '../../slices/configManagerJsonSlices/itemAttribute/reducer';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Grid,
  Typography,
  Checkbox,
  TextField,
  Button,
} from '@mui/material';

const RightColumn: React.FC = () => {
  const dispatch = useDispatch();
  const attributes = useSelector((state: RootState) => state.attribute.attributes);
  const selectedAttr = useSelector((state: RootState) => state.attribute.selectedAttr);
  const formData = useSelector((state: RootState) => state.attribute.formData);
  const selectedRow = useSelector((state: RootState) => state.tree.selectedRow);
  const file = useSelector((state: RootState) => state.file.file);

  const handleRowClick = (attr: ServiceCharacteristicReadable) => {
    dispatch(setSelectedAttr(attr));
    dispatch(
      setFormData({
        label: attr.readnames || '',
        value: attr.value || '',
        description: '',
      })
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(setFormData({ ...formData, [name]: value }));
  };

  const handleSave = () => {
    if (!selectedAttr || !selectedRow) return;

    const updated = attributes.map((attr: ServiceCharacteristicReadable) =>
      attr.readnames === selectedAttr.readnames
        ? { ...attr, name: formData.label, value: formData.value, description: formData.description }
        : attr
    );
    dispatch(setAttributes(updated));

    const fileName = file?.name || 'default.json';
    const jsonStr = localStorage.getItem(fileName);
    if (jsonStr) {
      const json: NetworkServiceNode[] = JSON.parse(jsonStr);
      const updateNode = (nodes: NetworkServiceNode[]): NetworkServiceNode[] =>
        nodes.map((node) => {
          if (node.extId === selectedRow) {
            return {
              ...node,
              serviceCharacteristic: node.metadata?.serviceCharacteristicReadables.map((char: any) =>
                char.name === selectedAttr.readnames
                  ? { ...char, name: formData.label, value: formData.value, description: formData.description }
                  : char
              ),
            };
          }
          return { ...node, children: updateNode(node.children || []) };
        });

      const updatedJson = updateNode(json);
      localStorage.setItem(fileName, JSON.stringify(updatedJson));
      dispatch(setTreeData(updatedJson));
    }

    dispatch(setFormData({ label: '', value: '', description: '' }));
    dispatch(setSelectedAttr(null));
  };

  return (

    <Paper elevation={1} sx={{ borderRadius: 2, bgcolor: 'background.paper', height: '100%'}}>
      {/* <Typography variant="h6" gutterBottom>
        Item Attributes
      </Typography> */}

      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          borderBottom: "2px solid #E0E0E0", // 👈 bottom line
          borderRadius: "4px",
          pl: 2,
          pr: 2,
          pt: 1,
          pb: 1
        }}
      >
        Item Attributes
      </Typography>

      {/* Attributes Table */}
      <Box sx={{
        pr: 2,
        pl: 2
      }}>
        {/* <TableContainer component={Paper} sx={{ maxHeight: 400, mt: 3, mb: 3 }}>
          <Table stickyHeader size="small">
            <TableHead sx={{ bgcolor: '#F3F6F9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Readonly</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Sensitive Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attributes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Select Technical Item List
                  </TableCell>
                </TableRow>
              ) : (
                attributes.map((attr, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    selected={selectedAttr?.readnames === attr.readnames}
                    onClick={() => handleRowClick(attr)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: idx % 2 === 0 ? 'background.paper' : 'grey.100',
                    }}
                  >
                    <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {attr.readnames}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {attr.value || ''}
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox checked={false} disabled />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer> */}
        <TableContainer
          component={Paper}
          sx={{
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            maxHeight: 400,
            backgroundColor: "#fff",
            overflow: "auto", // ✅ ensure proper scroll
            mt: 3,
            mb: 3,
          }}
        >
          <Table stickyHeader size="small" aria-label="Item Attributes table">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    // width: "40%",
                    backgroundColor: "#F4F4FB",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  Label
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    // width: "40%",
                    backgroundColor: "#F4F4FB",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  Value
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 500,
                    // width: "20%",
                    backgroundColor: "#F4F4FB",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  Readonly
                </TableCell>
                  <TableCell
                  align="center"
                  sx={{
                    fontWeight: 500,
                    
                    backgroundColor: "#F4F4FB",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  Sensitive Value
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {attributes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{ color: "text.secondary", py: 3 }}
                  >
                    Select Technical Item List
                  </TableCell>
                </TableRow>
              ) : (
                attributes.map((attr, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    selected={selectedAttr?.readnames === attr.readnames}
                    onClick={() => handleRowClick(attr)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: idx % 2 === 0 ? "background.paper" : "grey.100",
                    }}
                  >
                    <TableCell
                      sx={{
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {attr.readnames}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {attr.value || ""}
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox checked={false} disabled />
                    </TableCell>
                    <TableCell align="center">
                    
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>


      {/* Attribute Detail Form */}
      <Box sx={{
        pr: 2,
        pl: 2,
        pb: 2
      }}>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          {/* MACD Order(s) */}
          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              MACD Order(s)
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter MACD Order(s)"
              variant="outlined"
              InputLabelProps={{ shrink: false }}
            />
          </Box>

          {/* Attribute Name */}
          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Attribute Name
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              placeholder="Enter Attribute Name"
              variant="outlined"
              InputLabelProps={{ shrink: false }}
            />
          </Box>
        </Box>

        {/* Attribute Value */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            Attribute Value
          </Typography>
          <TextField
            fullWidth
            size="small"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            placeholder="Enter Attribute Value"
            variant="outlined"
            InputLabelProps={{ shrink: false }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSave}
            sx={{
              textTransform: "none",
              px: 3,
              borderRadius: 2,
              fontSize: 13,
            }}
          >
            Save
          </Button>
        </Box>

      </Box>

    </Paper>
  );
};

export default RightColumn;
