$csharpCode = @"
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Collections.Generic;

public class LogoProcessor
{
    public static void Process(string sourceJpg, string brandDir, string publicDir)
    {
        Directory.CreateDirectory(brandDir);
        Directory.CreateDirectory(publicDir);

        using (Bitmap src = new Bitmap(sourceJpg))
        {
            int w = src.Width;
            int h = src.Height;

            // 1. Save original full logo as PNG
            string fullPath = Path.Combine(brandDir, "logo-full.png");
            src.Save(fullPath, ImageFormat.Png);

            // 2. Create Transparent Logo via Flood Fill BFS from outer edges
            Bitmap transBmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(transBmp))
            {
                g.DrawImage(src, 0, 0, w, h);
            }

            BitmapData data = transBmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            IntPtr scan0 = data.Scan0;

            byte[] pixels = new byte[stride * h];
            System.Runtime.InteropServices.Marshal.Copy(scan0, pixels, 0, pixels.Length);

            bool[] visited = new bool[w * h];
            Queue<int> q = new Queue<int>();

            // Seed outer border
            for (int x = 0; x < w; x++)
            {
                q.Enqueue(x); // y = 0
                q.Enqueue((h - 1) * w + x); // y = h - 1
            }
            for (int y = 0; y < h; y++)
            {
                q.Enqueue(y * w); // x = 0
                q.Enqueue(y * w + (w - 1)); // x = w - 1
            }

            int threshold = 32;

            while (q.Count > 0)
            {
                int idx = q.Dequeue();
                if (idx < 0 || idx >= w * h) continue;
                if (visited[idx]) continue;
                visited[idx] = true;

                int py = idx / w;
                int px = idx % w;
                int byteOffset = py * stride + px * 4;

                byte b = pixels[byteOffset];
                byte gCol = pixels[byteOffset + 1];
                byte r = pixels[byteOffset + 2];

                int maxVal = Math.Max(r, Math.Max(gCol, b));

                if (maxVal <= threshold)
                {
                    pixels[byteOffset + 3] = 0; // transparent
                    if (px > 0 && !visited[idx - 1]) q.Enqueue(idx - 1);
                    if (px < w - 1 && !visited[idx + 1]) q.Enqueue(idx + 1);
                    if (py > 0 && !visited[idx - w]) q.Enqueue(idx - w);
                    if (py < h - 1 && !visited[idx + w]) q.Enqueue(idx + w);
                }
                else if (maxVal <= 65)
                {
                    double factor = (double)(maxVal - threshold) / (65 - threshold);
                    byte alpha = (byte)(factor * 255);
                    pixels[byteOffset + 3] = alpha;
                }
            }

            System.Runtime.InteropServices.Marshal.Copy(pixels, 0, scan0, pixels.Length);
            transBmp.UnlockBits(data);

            string transPath = Path.Combine(brandDir, "logo.png");
            transBmp.Save(transPath, ImageFormat.Png);
            Console.WriteLine("Saved: " + transPath);

            string publicLogoPath = Path.Combine(publicDir, "logo.png");
            transBmp.Save(publicLogoPath, ImageFormat.Png);
            Console.WriteLine("Saved: " + publicLogoPath);

            // 3. Create Circular Emblem Icon (Circle diameter ~760, centered at X=512, Y=406)
            int circleX = 132;
            int circleY = 24;
            int circleW = 760;
            int circleH = 760;

            Bitmap iconBmp = new Bitmap(circleW, circleH, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(iconBmp))
            {
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;

                // Draw circular clip path
                using (GraphicsPath path = new GraphicsPath())
                {
                    path.AddEllipse(2, 2, circleW - 4, circleH - 4);
                    g.SetClip(path);
                    g.DrawImage(transBmp, new Rectangle(0, 0, circleW, circleH), new Rectangle(circleX, circleY, circleW, circleH), GraphicsUnit.Pixel);
                }
            }

            string brandIconPath = Path.Combine(brandDir, "logo-icon.png");
            iconBmp.Save(brandIconPath, ImageFormat.Png);
            Console.WriteLine("Saved: " + brandIconPath);

            // 4. Generate PWA Icons (with safe margin for Android/iOS maskable launchers)
            SaveResizedWithPadding(transBmp, Path.Combine(publicDir, "icon-192x192.png"), 192, 192, 0.94);
            SaveResizedWithPadding(transBmp, Path.Combine(publicDir, "icon-512x512.png"), 512, 512, 0.94);
            SaveResizedWithPadding(iconBmp, Path.Combine(publicDir, "apple-touch-icon.png"), 180, 180, 0.92);

            // 5. Generate Favicons using the high-contrast circular emblem
            SaveResizedWithPadding(iconBmp, Path.Combine(publicDir, "favicon-32x32.png"), 32, 32, 1.0);
            SaveResizedWithPadding(iconBmp, Path.Combine(publicDir, "favicon-16x16.png"), 16, 16, 1.0);

            // 6. Generate 1200x630 Open Graph Social Preview Image (og-image.png)
            using (Bitmap ogBmp = new Bitmap(1200, 630, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(ogBmp))
                {
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

                    // Background Gradient (#001d36 to #003656)
                    using (LinearGradientBrush bgBrush = new LinearGradientBrush(new Rectangle(0, 0, 1200, 630), Color.FromArgb(0, 29, 54), Color.FromArgb(0, 54, 86), 135f))
                    {
                        g.FillRectangle(bgBrush, 0, 0, 1200, 630);
                    }

                    // Decorative subtle glow circles
                    using (SolidBrush glow1 = new SolidBrush(Color.FromArgb(25, 0, 102, 138)))
                    {
                        g.FillEllipse(glow1, 850, -100, 500, 500);
                        g.FillEllipse(glow1, -100, 350, 450, 450);
                    }

                    // Draw Logo on the left/center
                    int logoSize = 480;
                    int logoX = 80;
                    int logoY = (630 - logoSize) / 2;
                    g.DrawImage(transBmp, new Rectangle(logoX, logoY, logoSize, logoSize));

                    // Text Info on the right
                    int textX = 600;
                    using (Font titleFont = new Font("Arial", 46, FontStyle.Bold))
                    using (Font subtitleFont = new Font("Arial", 22, FontStyle.Bold))
                    using (Font descFont = new Font("Arial", 16, FontStyle.Regular))
                    using (Font tagFont = new Font("Arial", 13, FontStyle.Bold))
                    using (SolidBrush whiteBrush = new SolidBrush(Color.White))
                    using (SolidBrush cyanBrush = new SolidBrush(Color.FromArgb(56, 189, 248)))
                    using (SolidBrush mutedBrush = new SolidBrush(Color.FromArgb(196, 231, 255)))
                    {
                        // Badge Pill
                        using (SolidBrush pillBg = new SolidBrush(Color.FromArgb(40, 56, 189, 248)))
                        using (Pen pillPen = new Pen(Color.FromArgb(56, 189, 248), 1.5f))
                        {
                            g.FillRectangle(pillBg, textX, 120, 290, 36);
                            g.DrawRectangle(pillPen, textX, 120, 290, 36);
                        }
                        g.DrawString("AI-POWERED FOOD SAFETY", tagFont, cyanBrush, textX + 18, 130);

                        // Main Titles
                        g.DrawString("MilkGuard", titleFont, whiteBrush, textX, 175);
                        g.DrawString("Pure Milk. Real Results.", subtitleFont, cyanBrush, textX, 245);

                        // Description bullets
                        int bulletY = 310;
                        g.DrawString("-  Instant 14-Channel Spectral Analysis", descFont, mutedBrush, textX, bulletY);
                        g.DrawString("-  AI Adulteration Detection & Purity Scoring", descFont, mutedBrush, textX, bulletY + 38);
                        g.DrawString("-  Cryptographically Verified on Polygon Blockchain", descFont, mutedBrush, textX, bulletY + 76);
                        g.DrawString("-  FSSAI Compliance Standards Verification", descFont, mutedBrush, textX, bulletY + 114);

                        // Footer note
                        g.DrawString("hackathon-milkgaurd-web.vercel.app  |  Team API Avengers", tagFont, mutedBrush, textX, 530);
                    }
                }
                string ogPath = Path.Combine(publicDir, "og-image.png");
                ogBmp.Save(ogPath, ImageFormat.Png);
                Console.WriteLine("Saved: " + ogPath);
            }

            // Save .ico
            using (Bitmap ico32 = new Bitmap(32, 32, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(ico32))
                {
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.DrawImage(iconBmp, 0, 0, 32, 32);
                }
                IntPtr hIcon = ico32.GetHicon();
                using (Icon icon = Icon.FromHandle(hIcon))
                {
                    using (FileStream fs = new FileStream(Path.Combine(publicDir, "favicon.ico"), FileMode.Create))
                    {
                        icon.Save(fs);
                    }
                }
            }
            Console.WriteLine("Saved favicon.ico and all PWA icons successfully.");

            transBmp.Dispose();
            iconBmp.Dispose();
        }
    }

    private static void SaveResizedWithPadding(Bitmap source, string destPath, int targetW, int targetH, double scale)
    {
        using (Bitmap target = new Bitmap(targetW, targetH, PixelFormat.Format32bppArgb))
        {
            using (Graphics g = Graphics.FromImage(target))
            {
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.Transparent);

                int drawW = (int)(targetW * scale);
                int drawH = (int)(targetH * scale);
                int offX = (targetW - drawW) / 2;
                int offY = (targetH - drawH) / 2;

                g.DrawImage(source, new Rectangle(offX, offY, drawW, drawH));
            }
            target.Save(destPath, ImageFormat.Png);
            Console.WriteLine("Saved: " + destPath);
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing

$source = "C:\Users\admin\.gemini\antigravity-ide\brain\c0c3f8a3-49b8-4705-9217-f830fe20ef36\.user_uploaded\media_1788604671871.jpg"
$brandDir = "e:\MilkGaurd\web\public\brand"
$publicDir = "e:\MilkGaurd\web\public"

[LogoProcessor]::Process($source, $brandDir, $publicDir)
