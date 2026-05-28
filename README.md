# SAM Bubble Studio

SAM Bubble Studio là một web app mini dùng để tạo ảnh quảng cáo nhanh cho spa, skinlab, thẩm mỹ viện hoặc các nội dung bán hàng dạng hình ảnh. Người dùng có thể upload ảnh nền, chọn template có sẵn, chỉnh chữ, chỉnh khung thông tin, kéo thả từng thành phần trên điện thoại và xuất ảnh PNG chất lượng cao.

Dự án được xây dựng bằng React + TypeScript + Vite + Tailwind CSS, tập trung vào trải nghiệm chỉnh sửa trên mobile phone.

---

## 1. Tính năng hiện tại

### 1.1 Upload và hiển thị ảnh nền

- Upload ảnh trực tiếp từ máy tính hoặc điện thoại.
- Hỗ trợ file ảnh thông dụng qua input `image/*`.
- Sau khi upload, ảnh được hiển thị làm background trong canvas thiết kế.
- Tự đọc tỉ lệ ảnh gốc để hỗ trợ chế độ canvas theo ảnh gốc.
- Có placeholder hướng dẫn khi chưa upload ảnh.

### 1.2 Chỉnh tỉ lệ khung thiết kế

Người dùng có thể chọn nhiều tỉ lệ canvas khác nhau:

- `9:16` — phù hợp Story, Reels, TikTok, Facebook Story.
- `16:9` — ảnh ngang.
- `1:1` — ảnh vuông.
- `4:5` — phù hợp Facebook, Instagram feed.
- `5:4` — ảnh ngang nhẹ.
- `3:4` — ảnh dọc.
- `4:3` — ảnh ngang cổ điển.
- `Gốc` — dùng đúng tỉ lệ ảnh upload.

### 1.3 Chế độ hiển thị ảnh nền

Ảnh nền có 2 chế độ fit:

- `contain`: giữ toàn bộ ảnh, không bị cắt ảnh.
- `cover`: phủ kín khung thiết kế, có thể bị crop một phần ảnh.

Ngoài ra có thể chỉnh màu nền canvas bằng `canvasBgColor`. Màu này sẽ hiện ở vùng trống nếu ảnh đang dùng chế độ `contain`.

### 1.4 Chỉnh ảnh nền trên mobile

Có chế độ `Chỉnh ảnh nền` để thao tác trực tiếp với ảnh phía sau:

- Kéo ảnh nền sang trái/phải/lên/xuống.
- Dùng 2 ngón tay để pinch zoom ảnh nền.
- Có giới hạn scale để tránh ảnh quá nhỏ hoặc quá lớn.
- Có nút reset ảnh nền về vị trí ban đầu.
- Khi bật chỉnh ảnh nền, app hiển thị khung dashed màu xanh lá quanh canvas để báo đang chỉnh background.

### 1.5 Hệ thống template bubble có sẵn

Dự án hiện có nhiều template quảng cáo/bubble dựng sẵn trong `src/data/bubbleTemplates.ts`, gồm:

1. Luxury Card
2. Left Panel
3. Glass Top
4. Minimal White
5. Gold Frame
6. Split Contact
7. Rounded Dark
8. Vertical Menu
9. Soft Pink
10. Premium Footer
11. Top Luxury Bar
12. Black Gold Sidebar
13. White Clean Sidebar
14. Rose Glass Card
15. Center Title List
16. Corner Badge List
17. Full Width Bottom
18. Bento Beauty
19. Minimal Line
20. Magazine Cover

Mỗi template có:

- `id`: mã template dùng trong code.
- `name`: tên hiển thị.
- `description`: mô tả ngắn.
- `defaultBox`: vị trí và kích thước mặc định khi render trên canvas.

### 1.6 Chỉnh template cha khi chưa bật chỉnh từng element

Khi chưa bật chế độ `Chỉnh từng element`, app hoạt động theo kiểu chỉnh cả cụm template cha:

- Template cha được bao quanh bởi khung dashed rectangle.
- Có thể kéo toàn bộ template đến bất kỳ vị trí nào trong canvas.
- Có thể resize width/height của toàn bộ template.
- Hỗ trợ kéo bằng chuột trên desktop.
- Hỗ trợ chạm kéo trên mobile.
- Hỗ trợ pinch 2 ngón để phóng to/thu nhỏ cụm template cha.
- Khi export ảnh, khung dashed sẽ tự ẩn đi.

Chế độ này phù hợp khi người dùng chỉ muốn đặt nhanh một template có sẵn lên ảnh mà không cần chỉnh sâu từng dòng chữ.

### 1.7 Chỉnh từng element con

Khi bật `Chỉnh từng element`, template được tách thành các layer riêng để chỉnh độc lập.

Các loại layer hiện tại:

- `text`: chữ đơn, ví dụ brand, subtitle, hotline, địa chỉ.
- `service-list`: danh sách dịch vụ nhiều dòng.
- `box`: khối nền/trang trí/card.

Ở chế độ này, người dùng có thể:

- Click hoặc chạm vào từng element để chọn.
- Element được chọn sẽ hiện khung dashed bao quanh.
- Các element khác cũng có thể hiện khung frame hỗ trợ nhận diện vị trí.
- Kéo element đến vị trí bất kỳ trong canvas.
- Resize width/height bằng cạnh hoặc góc.
- Chỉnh trực tiếp thông số X/Y/Width/Height bằng panel.
- Chỉnh layer theo thời gian thực khi kéo hoặc resize.
- Dùng mobile touch để thao tác element.
- Dùng 2 ngón tay pinch để thay đổi kích thước layer text/box.

### 1.8 Khung dashed chỉnh sửa

Dự án hiện đã hỗ trợ dashed rectangle cho cả 2 cấp:

- Template cha: hiển thị khi chưa bật `Chỉnh từng element`.
- Element con: hiển thị khi bật `Chỉnh từng element`.

Mục đích:

- Giúp user biết chính xác element nào đang được chỉnh.
- Dễ thao tác trên màn hình điện thoại.
- Dễ resize chữ, hình, nền, card hoặc cả cụm template.
- Khi export ảnh PNG, toàn bộ khung dashed sẽ bị ẩn.

### 1.9 Panel chỉnh layer

Khi chọn một element, panel `LayerSettingPanel` cho phép chỉnh:

- Nội dung chữ.
- Danh sách dịch vụ.
- Font size.
- Font weight.
- Letter spacing.
- Line height.
- Căn chữ: trái, giữa, phải.
- Màu chữ.
- Màu nền.
- Bo góc.
- Opacity.
- Width.
- Height.
- X.
- Y.

Panel cũng có các thao tác quản lý layer:

- Nhân đôi layer.
- Xóa layer.
- Đưa layer lên trên.
- Đưa layer xuống dưới.

### 1.10 Thêm layer mới

Trong chế độ chỉnh từng element, app hỗ trợ:

- `Thêm chữ`: tạo một text layer mới.
- `Thêm nền`: tạo một box layer mới.

Layer mới sẽ được thêm vào canvas và có `zIndex` cao hơn các layer hiện tại để dễ nhìn và dễ chỉnh.

### 1.11 Chỉnh nội dung nhanh

App có khu vực chỉnh nội dung nhanh cho template, gồm các thông tin mặc định:

- Tên thương hiệu.
- Subtitle/mô tả ngắn.
- Số điện thoại.
- Facebook.
- Địa chỉ.
- Danh sách dịch vụ.

Nội dung mặc định hiện nằm trong:

```txt
src/data/bubbleTemplates.ts
```

và được lưu/đọc qua:

```txt
src/utils/storage.ts
```

### 1.12 Fullscreen editor trên mobile

App có chế độ chỉnh sửa fullscreen để dùng trên điện thoại dễ hơn:

- Canvas chiếm gần toàn màn hình.
- Có thanh công cụ mobile phía dưới.
- Có nút upload nhanh.
- Có nút mở panel chỉnh sửa.
- Có nút tải ảnh 2K.
- Có khu vực hướng dẫn thao tác mobile.

Chế độ này phù hợp nhất cho mục tiêu chính của project: chỉnh template và ảnh trên mobile phone.

### 1.13 Chỉnh text bằng bàn phím mobile

App có modal chỉnh text riêng cho mobile:

- Chọn một text layer.
- Mở trình sửa text.
- Textarea tự focus để bật bàn phím ảo.
- Với `service-list`, mỗi dòng trong textarea sẽ là một dịch vụ.
- Với `text`, nội dung textarea sẽ cập nhật trực tiếp vào layer chữ.

### 1.14 Export/download PNG chất lượng cao

App dùng `html-to-image` để export canvas thành PNG.

Tính năng export hiện tại:

- Export ảnh PNG với pixel ratio cao.
- Tên file mặc định: `sam-bubble-studio-2k.png`.
- Tự ẩn các khung dashed và UI chỉnh sửa khi xuất ảnh.
- Đợi ảnh trong canvas load xong trước khi export.
- Không ép background trắng khi export để tránh lỗi mất ảnh nền.
- Có `cacheBust` để giảm lỗi cache ảnh.
- Có `imagePlaceholder` để hạn chế lỗi ảnh không render trong quá trình export.

Trên desktop:

- App tự tạo link download và tải file về máy.

Trên mobile:

- App tạo preview ảnh sau khi export.
- Nếu trình duyệt hỗ trợ Web Share API, app sẽ mở share sheet để lưu/chia sẻ ảnh.
- Nếu không tự lưu được, người dùng có thể nhấn giữ ảnh preview rồi chọn `Lưu vào Ảnh` hoặc `Save Image`.

### 1.15 Trang admin nội dung

Project có trang admin tại:

```txt
/admin
```

Trang admin hiện dùng `localStorage`, phù hợp để chỉnh nhanh nội dung mặc định mà chưa cần backend.

Sau này nếu muốn nối database/backend thật, cần thay logic trong:

```txt
src/utils/storage.ts
```

---

## 2. Công nghệ sử dụng

### Core

- React 18
- TypeScript
- Vite
- Tailwind CSS

### Thư viện chính

- `react-rnd`: kéo thả và resize template/layer.
- `html-to-image`: export DOM/canvas thiết kế thành PNG.
- `lucide-react`: icon UI.

---

## 3. Cài đặt project

Cài dependencies:

```bash
npm install
```

Chạy môi trường dev:

```bash
npm run dev
```

Sau đó mở trình duyệt:

```txt
http://localhost:5173
```

Build production:

```bash
npm run build
```

Preview bản build:

```bash
npm run preview
```

---

## 4. Yêu cầu Node.js

Project đang cấu hình Node.js trong `package.json`:

```json
"engines": {
  "node": "20.x"
}
```

Vì vậy khi deploy lên Vercel/Netlify nên dùng Node.js 20 để tránh lệch môi trường build.

File `.nvmrc` cũng đang dùng Node 20.

---

## 5. Cấu trúc thư mục quan trọng

```txt
src/
  components/
    BubbleRenderer.tsx
    EditorControls.tsx
    TemplatePicker.tsx
    free-editor/
      LayerRenderer.tsx
      LayerSettingPanel.tsx

  data/
    bubbleTemplates.ts
    defaultLayers.ts

  pages/
    DesignPage.tsx
    AdminPage.tsx

  types/
    bubble.ts
    layer.ts

  utils/
    storage.ts

  main.tsx
  styles.css
```

---

## 6. Vai trò từng file chính

### `src/pages/DesignPage.tsx`

Đây là file quan trọng nhất của project.

File này xử lý:

- Upload ảnh.
- Render canvas thiết kế.
- Chọn tỉ lệ canvas.
- Chỉnh ảnh nền.
- Chọn template.
- Bật/tắt chỉnh từng element.
- Kéo thả template cha.
- Resize template cha.
- Kéo thả layer con.
- Resize layer con.
- Pinch zoom trên mobile.
- Mở editor text mobile.
- Export/download ảnh PNG.
- Hiển thị preview export trên mobile.

### `src/components/BubbleRenderer.tsx`

Render template bubble dạng nguyên khối khi chưa bật `Chỉnh từng element`.

File này dùng cho chế độ chỉnh template cha.

### `src/components/free-editor/LayerRenderer.tsx`

Render từng layer riêng lẻ trong chế độ `Chỉnh từng element`.

File này quyết định layer chữ, danh sách dịch vụ hoặc box nền hiển thị như thế nào trên canvas.

### `src/components/free-editor/LayerSettingPanel.tsx`

Panel chỉnh thông số layer đang được chọn.

Cho phép sửa chữ, màu, font, vị trí, kích thước, opacity, z-index và các thao tác nhân đôi/xóa layer.

### `src/components/EditorControls.tsx`

Khu vực điều khiển cơ bản:

- Upload hình ảnh.
- Tải PNG.
- Chỉnh nội dung nhanh.
- Chỉnh opacity/accent/template tùy theo props được truyền vào.

### `src/components/TemplatePicker.tsx`

Hiển thị danh sách template để người dùng chọn.

### `src/data/bubbleTemplates.ts`

Chứa:

- Nội dung mặc định của bubble.
- Danh sách template.
- Vị trí/kích thước mặc định của từng template.

### `src/data/defaultLayers.ts`

Chứa layout layer mặc định dùng trong chế độ `Chỉnh từng element`.

Khi đổi template hoặc reset vị trí, app sẽ tạo lại layer từ file này.

### `src/types/bubble.ts`

Định nghĩa type cho:

- Template id.
- Nội dung bubble.
- Kích thước/vị trí bubble cha.
- Cấu trúc template.

### `src/types/layer.ts`

Định nghĩa type cho từng layer chỉnh sửa tự do.

### `src/utils/storage.ts`

Xử lý lưu và đọc nội dung bằng `localStorage`.

### `src/styles.css`

CSS global, hiện có cấu hình phục vụ mobile/touch và một số style hỗ trợ editor.

---

## 7. Hướng dẫn sử dụng cơ bản

### Cách tạo ảnh quảng cáo nhanh

1. Mở app.
2. Upload ảnh nền.
3. Chọn tỉ lệ canvas phù hợp, ví dụ `9:16` cho Story/Reels.
4. Chọn template muốn dùng.
5. Chỉnh nội dung nhanh: thương hiệu, dịch vụ, hotline, địa chỉ.
6. Kéo template cha đến vị trí phù hợp.
7. Resize template cha nếu cần.
8. Bấm `Tải 2K` hoặc `Tải PNG` để xuất ảnh.

### Cách chỉnh sâu từng element

1. Upload ảnh nền.
2. Chọn template.
3. Bật `Chỉnh từng element`.
4. Chạm vào chữ, danh sách dịch vụ hoặc nền muốn chỉnh.
5. Dùng tay kéo layer đến vị trí mong muốn.
6. Kéo cạnh/góc dashed rectangle để resize.
7. Mở panel để chỉnh font, màu, opacity, X/Y, width/height.
8. Bấm `Tải 2K` để export.

### Cách chỉnh ảnh nền

1. Upload ảnh.
2. Bật `Chỉnh ảnh nền`.
3. Kéo ảnh nền để đổi vị trí.
4. Chụm/mở 2 ngón để zoom ảnh.
5. Tắt `Chỉnh ảnh nền` khi muốn quay lại chỉnh template/layer.

### Cách sửa chữ trên mobile

1. Bật `Chỉnh từng element`.
2. Chạm vào element chữ.
3. Mở sửa text mobile.
4. Nhập nội dung bằng bàn phím điện thoại.
5. Lưu lại nội dung.

---

## 8. Lưu ý khi export ảnh

- Khi export, app sẽ bật `exportMode` để ẩn dashed frame và UI chỉnh sửa.
- App đợi ảnh load xong rồi mới gọi `html-to-image`.
- Nếu dùng iPhone và ảnh quá nặng, export có thể thất bại do giới hạn bộ nhớ trình duyệt.
- Nên dùng ảnh đã nén vừa phải khi chỉnh trên mobile.
- Trên mobile, nếu file không tự tải xuống, hãy dùng ảnh preview và chọn `Save Image`.

---

## 9. Lưu ý khi chỉnh trên mobile

- Nên dùng Chrome Android hoặc Safari iPhone bản mới.
- Khi chỉnh ảnh nền, các layer/template sẽ tạm không nhận pointer để tránh thao tác nhầm.
- Khi chỉnh layer, nên tắt `Chỉnh ảnh nền`.
- Khi chưa bật `Chỉnh từng element`, thao tác sẽ áp dụng cho cả template cha.
- Khi đã bật `Chỉnh từng element`, thao tác sẽ áp dụng cho từng layer con.

---

## 10. Các trạng thái chỉnh sửa quan trọng trong code

Trong `DesignPage.tsx` có một số state quan trọng:

```ts
imageUrl              // ảnh nền upload
imageNaturalRatio     // tỉ lệ ảnh gốc
imageTransform        // vị trí và scale ảnh nền
canvasRatioId         // tỉ lệ canvas đang chọn
imageFit              // contain hoặc cover
canvasBgColor         // màu nền canvas
templateId            // template đang chọn
content               // nội dung template
opacity               // opacity template
accentColor           // màu nhấn
freeEdit              // bật/tắt chỉnh từng element
backgroundEditMode    // bật/tắt chỉnh ảnh nền
showLayerFrames       // hiện/ẩn khung layer
layers                // danh sách layer con
selectedLayerId       // layer đang chọn
exportMode            // trạng thái đang export
bubbleBox             // vị trí/kích thước template cha
```

---

## 11. Deploy

Project có thể deploy lên Vercel hoặc Netlify.

Lệnh build:

```bash
npm run build
```

Thư mục output mặc định của Vite:

```txt
dist
```

Với Vercel, nên để Node.js là 20.x để khớp `package.json`.

---

## 12. Những tính năng có thể phát triển tiếp

Một số hướng nâng cấp hợp lý:

- Thêm undo/redo.
- Thêm rotate layer.
- Thêm upload logo riêng.
- Thêm crop ảnh nền.
- Thêm lưu project dưới dạng JSON.
- Thêm load lại thiết kế đã lưu.
- Thêm export nhiều size: 1080x1920, 1080x1080, 1200x1500.
- Thêm template riêng cho ngành vòng đá, mỹ phẩm, spa, nail, salon.
- Thêm font picker.
- Thêm shadow cho text/layer.
- Thêm lock/unlock layer.
- Thêm snap line/căn giữa tự động.
- Thêm backend để lưu template theo tài khoản.

---

## 13. Ghi chú sửa lỗi gần nhất

Bản hiện tại đã được chỉnh theo hướng ưu tiên mobile:

- Click/chạm element sẽ hiện dashed rectangle bao quanh.
- Text, hình/nền, danh sách dịch vụ và template cha đều có frame chỉnh sửa.
- Layer con đã kéo thả được sang vị trí khác, không chỉ resize width/height.
- Khi chưa bật `Chỉnh từng element`, template cha vẫn kéo thả và resize được.
- Export PNG đã được chỉnh để hạn chế lỗi chỉ tải template mà mất ảnh nền.
- Export không ép background trắng nữa, tránh lỗi ảnh bị nền trắng che mất.
- Export có chờ ảnh load trước khi tạo PNG.

---

## 14. Tóm tắt nhanh

SAM Bubble Studio hiện là app tạo ảnh quảng cáo mobile-first với các tính năng chính:

- Upload ảnh.
- Chọn tỉ lệ canvas.
- Chọn template.
- Chỉnh template cha.
- Chỉnh từng element con.
- Kéo thả/resize trên mobile.
- Chỉnh ảnh nền bằng kéo/chụm 2 ngón.
- Sửa text bằng bàn phím điện thoại.
- Thêm/xóa/nhân đôi/sắp xếp layer.
- Export PNG 2K.
- Có trang admin nội dung cơ bản dùng localStorage.
