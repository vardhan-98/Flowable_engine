import type { MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';
import {
  TableRow,
  TableCell,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import type { RootState } from '../../slices';
import type { NetworkServiceNode } from '../../types/ConfigMangerJsonInterface';
import { setSelectedRow, toggleExpandedId } from '../../slices/configManagerJsonSlices/orderContent/reducer';
import { setAttributes, setFormData, setSelectedAttr } from '../../slices/configManagerJsonSlices/itemAttribute/reducer';

interface TreeNodeProps {
  node: NetworkServiceNode;
  //  level?: number;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({node}) => {
  const dispatch = useDispatch();
  const selectedRow = useSelector((state: RootState) => state.tree.selectedRow);
  const expandedIds = useSelector((state: RootState) => state.tree.expandedIds);

  const hasChildren = (node.children?.length || 0) > 0;
  const expanded = !!expandedIds[node.extId];

  // const indentPx = level * 2; 

  const onToggle = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (hasChildren) dispatch(toggleExpandedId(node.extId));
  };

  const handleLeftEditClick = (node: NetworkServiceNode) => {
    dispatch(setAttributes(node.metadata?.serviceCharacteristicReadables || []));
    dispatch(setSelectedAttr(null));
    dispatch(setFormData({ label: '', value: '', description: '' }));
    dispatch(setSelectedRow(node.extId));
  };

  const onItemDescClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      dispatch(toggleExpandedId(node.extId));
          dispatch(toggleExpandedId(node.extId));

    } else {
      handleLeftEditClick(node);
    }
  };


  const displayText = node.description || '';

  return (
    <>
      <TableRow
        hover
        selected={selectedRow === node.extId}
        onClick={() => handleLeftEditClick(node)}
      >
        {/* Top Owner */}
        <TableCell sx={{ width: '20%', maxWidth: '9ch', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {node.extId}
        </TableCell>

        {/* Item Description */}
        <TableCell
          sx={{ width: '55%',     color: selectedRow === node.extId ? "#1976d2" : "inherit", // 🔵 blue when selected
 }}
          onClick={onItemDescClick}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={onToggle}
              disabled={!hasChildren}
              aria-label={hasChildren ? (expanded ? 'Collapse' : 'Expand') : undefined}
              aria-expanded={hasChildren ? expanded : undefined}
            >
              {hasChildren ? (
                expanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />
              ) : (
                <Typography sx={{ color: 'text.disabled' }}>•</Typography>
              )}
            </IconButton>
            <Typography
              noWrap
              sx={{ maxWidth: '32ch', overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={displayText}
            >
              {displayText}
            </Typography>
          </Box>
        </TableCell>

        {/* Action */}
        <TableCell align="center" sx={{ width: '20%' }}>
          ADD
        </TableCell>
        {/* Created Date */}
        <TableCell align="center" sx={{ width: '20%' }}>
          {new Date().toISOString().split('T')[0]}
        </TableCell>
      </TableRow>

      {/* Render Children */}
      {hasChildren && expanded && node.children.map((child, idx) => (
        <TreeNodeComponent key={`${child.extId}-${idx}`} node={child} />
      ))}
    </>
  );
};

export default TreeNodeComponent;
