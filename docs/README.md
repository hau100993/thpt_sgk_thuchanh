# Vật lí 12 tương tác

Sách Vật lí 12 dạng web: 10 bài học theo chương trình GDPT 2018, mỗi bài có một mô phỏng 3D, công thức cập nhật theo số liệu, vòng **Dự đoán → Thử → Chứng minh → Bài tập**, con dấu tiến độ và ghi chú cho giáo viên.

Site tĩnh thuần HTML/CSS/JS, không cần build, không cần thư viện ngoài (font Google là tuỳ chọn; mất mạng vẫn chạy với font hệ thống). Mở `index.html` bằng trình duyệt là dùng được.

## Danh sách bài

| Chủ đề | Bài | Mô phỏng |
|---|---|---|
| Vật lí nhiệt | 01 Cấu trúc của chất và sự chuyển thể | Động lực học phân tử Lennard-Jones, 125 phân tử |
| | 02 Nội năng và định luật I NĐLH | Xi-lanh khí, đun/nén, sổ ΔU = A + Q |
| | 03 Nhiệt dung riêng, nhiệt nóng chảy riêng, nhiệt hoá hơi riêng | Đun nước đá −20 °C đến hoá hơi hết |
| Khí lí tưởng | 04 Mô hình động học phân tử chất khí | Phân bố Maxwell, chuyển động Brown |
| | 05 Các định luật chất khí và phương trình trạng thái | Đẳng nhiệt, đẳng áp, đẳng tích |
| Từ trường | 06 Từ trường và lực từ | Dây dẫn trong nam châm chữ U, F = BIL sin α |
| | 07 Từ thông và cảm ứng điện từ | Nam châm qua cuộn dây, Faraday và Lenz |
| | 08 Máy phát điện xoay chiều | Khung dây quay, e = E₀ sin ωt |
| Vật lí hạt nhân | 09 Cấu trúc hạt nhân và năng lượng liên kết | Dựng hạt nhân, đồ thị Wlk/A |
| | 10 Phóng xạ và chu kì bán rã | Khối hạt nhân phân rã ngẫu nhiên |

## Đưa lên mạng

### Cách 1: GitHub Pages
1. Tạo repo mới trên GitHub, ví dụ `vatly12`.
2. Chép toàn bộ nội dung thư mục này (có `index.html`, `assets/`, `bai/`, `.nojekyll`) vào gốc repo, commit và push:
   ```bash
   git init
   git add .
   git commit -m "Vật lí 12 tương tác"
   git branch -M main
   git remote add origin https://github.com/<tên-bạn>/vatly12.git
   git push -u origin main
   ```
3. Trên GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, chọn `main` và thư mục `/ (root)`, bấm Save.
4. Sau khoảng 1 phút, trang có ở `https://<tên-bạn>.github.io/vatly12/`.

### Cách 2: Cloudflare Pages (nhanh hơn ở Việt Nam)
- **Kéo thả:** vào dash.cloudflare.com → Workers & Pages → Create → Pages → *Upload assets*, kéo cả thư mục vào, đặt tên dự án, Deploy.
- **Nối với GitHub:** Create → Pages → *Connect to Git*, chọn repo ở trên. Build command để trống, Build output directory là `/`. Mỗi lần push, Cloudflare tự cập nhật.

## Sửa và thêm bài (dành cho người phát triển)

Mã nguồn nằm trong thư mục dự án gốc, không phải thư mục đã build:

```
src/index.html          trang mục lục
src/bai/NN-ten-bai.html nội dung từng bài (dòng đầu: <!-- title: ... -->)
assets/book.css         toàn bộ giao diện, màu sáng/tối
assets/core.js          bộ vẽ 3D nét mực (Ink3D), đồ thị, con dấu, mô phỏng khí
build.py                ghép src/ thành dist/
```

Thêm một bài mới:
1. Chép một file trong `src/bai/` làm khung, đổi nội dung và mã mô phỏng.
2. Thêm một dòng vào `VL.LESSONS` trong `assets/core.js` (mục lục và nút bài trước/sau tự cập nhật).
3. Chạy `python3 build.py`, mở `dist/index.html` để xem.

## Bản quyền nội dung
Toàn bộ lời giảng, bài tập và hình vẽ được tự biên soạn theo yêu cầu cần đạt của chương trình, không sao chép từ sách giáo khoa của bộ nào. Số liệu vật lí (nhiệt dung riêng, năng lượng liên kết, chu kì bán rã…) là hằng số khoa học công khai.
