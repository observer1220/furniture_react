import { useEffect, useState } from "react";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  fetchProducts,
  addProduct,
  editProduct,
  deleteProduct,
} from "../api/products";
import { fetchCategories } from "../api/category";
import { stock_status } from "../enum/enums";
import { CategoryType, ProductType } from "../interface";
import TableHeader from "../components/TableHeader";
import DialogComponent from "../components/DialogComponent";
import { CreateButton, EditButton, DeleteButton } from "../components/Buttons";
import { formatNumber } from "../utils/numbers";
import { handleInputChange, handleSelectChange } from "../utils/formHandlers";

const ProductTable: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [productList, setProductList] = useState<ProductType[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<ProductType>>({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [products, categories] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProductList(products);
      setCategoryList(categories);
    } catch (error) {
      console.error("Request Error:", error);
    }
  };

  const handleOpenDialog = () => {
    setCurrentItem({});
    setIsEditing(false);
    setOpen(true);
  };

  const handleEdit = (item: ProductType) => {
    setCurrentItem(item);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setProductList((prev) => prev.filter((item) => item.id !== id));
    deleteProduct(id);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    // console.log("item", item);
    if (!isEditing) {
      addProduct(currentItem);
    } else {
      editProduct(currentItem.id, currentItem);
    }
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <TableHeader>
        <h3>產品管理</h3>
        <CreateButton onClick={handleOpenDialog} />
      </TableHeader>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名稱</TableCell>
              <TableCell>原價</TableCell>
              <TableCell>折扣價</TableCell>
              <TableCell>庫存</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>分類</TableCell>
              <TableCell>功能</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productList?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{formatNumber(item.price)} 元</TableCell>
                <TableCell>{formatNumber(item.discount_price)} 元</TableCell>
                <TableCell>{formatNumber(item.stock)} 件</TableCell>
                <TableCell>
                  {stock_status[item.status as keyof typeof stock_status]}
                </TableCell>
                <TableCell>
                  {categoryList.find((c) => c.id === item.category_id)?.name}
                </TableCell>
                <TableCell>
                  <EditButton onClick={() => handleEdit(item)} />
                  <DeleteButton onClick={() => handleDelete(item.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DialogComponent
        open={open}
        onClose={handleCloseDialog}
        currentItem={currentItem}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        children={
          <>
            <TextField
              margin="dense"
              name="name"
              label="家具名稱"
              fullWidth
              value={currentItem.name || ""}
              onChange={(e) => handleInputChange(e, setCurrentItem)}
            />
            <TextField
              margin="dense"
              name="price"
              label="原價"
              type="number"
              fullWidth
              value={currentItem.price || ""}
              onChange={(e) => handleInputChange(e, setCurrentItem)}
            />
            <TextField
              margin="dense"
              name="discount_price"
              label="折扣價"
              type="number"
              fullWidth
              value={currentItem.discount_price || ""}
              onChange={(e) => handleInputChange(e, setCurrentItem)}
            />
            <TextField
              margin="dense"
              name="stock"
              label="庫存"
              type="number"
              fullWidth
              value={currentItem.stock || ""}
              onChange={(e) => handleInputChange(e, setCurrentItem)}
            />
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>狀態</InputLabel>
              <Select
                name="status"
                label="狀態"
                value={currentItem.status || ""}
                onChange={(event) => handleSelectChange(event, setCurrentItem)}
                fullWidth
              >
                {stock_status &&
                  Object.keys(stock_status)?.map((key) => (
                    <MenuItem key={key} value={key}>
                      {stock_status[key as keyof typeof stock_status]}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>分類</InputLabel>
              <Select
                name="category_id"
                label="分類"
                value={currentItem.category_id || 0}
                onChange={(event) => handleSelectChange(event, setCurrentItem)}
              >
                {categoryList?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        }
      />
    </>
  );
};

export default ProductTable;
