# SAM Bubble Studio

Website mini giúp upload ảnh spa/skinlab, kéo thả bubble quảng cáo, chỉnh nội dung và tải ảnh PNG.

## Tính năng chính

- Upload hình từ máy tính hoặc điện thoại.
- 10 template bubble thiết kế sẵn.
- Chế độ chỉnh bubble tổng thể: kéo cả bubble, resize cả bubble.
- Chế độ **Chỉnh từng element**: kéo/resize riêng từng chữ, nền, hotline, danh sách dịch vụ.
- Chỉnh width, height, X, Y bằng tay trong panel.
- Chỉnh font size, font weight, line height, letter spacing, căn chữ, màu chữ, màu nền, opacity.
- Thêm chữ mới, thêm nền mới, nhân đôi layer, xóa layer, đưa layer lên/xuống.
- Tải thành phẩm về PNG.
- Responsive tốt trên điện thoại.
- Trang admin quản lý nội dung mặc định.

## Cài đặt

```bash
npm install
```

## Chạy dev

```bash
npm run dev
```

Sau đó mở:

```txt
http://localhost:5173
```

## Trang admin

```txt
http://localhost:5173/admin
```

Trang admin hiện đang lưu nội dung bằng `localStorage` để dùng nhanh. Sau này muốn nối backend/database thật thì thay logic ở:

```txt
src/utils/storage.ts
```

## Build production

```bash
npm run build
npm run preview
```

## Cách dùng chế độ chỉnh từng element

1. Upload ảnh.
2. Bật công tắc **Chỉnh từng element** trong panel công cụ.
3. Chạm/click vào chữ hoặc nền muốn chỉnh.
4. Kéo element để đổi vị trí.
5. Kéo nút xanh ở góc phải dưới để resize width/height.
6. Dùng panel để chỉnh số chính xác: Width, Height, X, Y, font size, màu, opacity.
7. Bấm **Tải PNG** để xuất ảnh.

## File quan trọng

```txt
src/pages/DesignPage.tsx                    Trang thiết kế chính
src/pages/AdminPage.tsx                     Trang admin nội dung
src/components/BubbleRenderer.tsx           10 template bubble tổng thể
src/components/free-editor/LayerRenderer.tsx Render từng element nhỏ
src/components/free-editor/LayerSettingPanel.tsx Panel chỉnh element
src/data/defaultLayers.ts                   Layout mặc định của chế độ chỉnh từng element
src/data/bubbleTemplates.ts                 Nội dung và danh sách template
```
