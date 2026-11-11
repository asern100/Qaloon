"""Clean up a scanned mushaf page: straighten it using the page frame,
flatten the paper to pure white, deepen the ink and refresh the colours.

usage: python enhance_scan.py in.png out.png [--width 1240]
"""
import sys
import cv2
import numpy as np


def order(pts):
    s = pts.sum(1); d = np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], np.float32)


def frame_quad(gray):
    """Corners of the outer page frame (the largest dark rectangle)."""
    th = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 31, 15)
    h, w = gray.shape
    hor = cv2.morphologyEx(th, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (w // 6, 1)))
    ver = cv2.morphologyEx(th, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, h // 6)))
    lines = cv2.dilate(hor | ver, np.ones((5, 5), np.uint8))
    cnts, _ = cv2.findContours(lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cnts, key=cv2.contourArea)
    if cv2.contourArea(c) < 0.3 * h * w:
        return None
    hull = cv2.convexHull(c)
    approx = cv2.approxPolyDP(hull, 0.02 * cv2.arcLength(hull, True), True)
    if len(approx) != 4:
        rect = cv2.minAreaRect(c)
        approx = cv2.boxPoints(rect)
    return order(approx.reshape(-1, 2).astype(np.float32))


def flatten_paper(img):
    """Divide out the uneven paper tone so the background becomes white."""
    out = np.empty_like(img)
    for i in range(3):
        ch = img[:, :, i]
        bg = cv2.morphologyEx(ch, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
        bg = cv2.GaussianBlur(bg, (0, 0), 15)
        out[:, :, i] = np.clip(ch.astype(np.float32) / np.maximum(bg, 1) * 255, 0, 255).astype(np.uint8)
    return out


def tone(img):
    f = img.astype(np.float32) / 255
    f = np.clip((f - 0.08) / (0.90 - 0.08), 0, 1)        # levels: white paper, solid ink
    f = f ** 1.15                                          # slightly deeper mid-tones
    hsv = cv2.cvtColor((f * 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.35, 0, 255)   # livelier pink/red
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)


def enhance(src, dst, width=1240):
    img = cv2.imread(src)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    q = frame_quad(gray)
    if q is not None:
        # Map the frame to a perfect upright rectangle, keeping a margin for the
        # running header above it and the page number below it.
        fw = int(max(np.linalg.norm(q[1] - q[0]), np.linalg.norm(q[2] - q[3])))
        fh = int(max(np.linalg.norm(q[3] - q[0]), np.linalg.norm(q[2] - q[1])))
        mx, mtop, mbot = int(fw * 0.025), int(fh * 0.065), int(fh * 0.045)
        target = np.array([[mx, mtop], [mx + fw, mtop], [mx + fw, mtop + fh], [mx, mtop + fh]], np.float32)
        M = cv2.getPerspectiveTransform(q, target)
        img = cv2.warpPerspective(img, M, (fw + 2 * mx, fh + mtop + mbot), flags=cv2.INTER_CUBIC,
                                  borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255))
    img = tone(flatten_paper(img))
    img = cv2.addWeighted(img, 1.5, cv2.GaussianBlur(img, (0, 0), 1.2), -0.5, 0)  # sharpen
    h, w = img.shape[:2]
    img = cv2.resize(img, (width, int(h * width / w)), interpolation=cv2.INTER_AREA if w > width else cv2.INTER_CUBIC)
    cv2.imwrite(dst, img, [cv2.IMWRITE_JPEG_QUALITY, 88])


if __name__ == '__main__':
    width = int(sys.argv[sys.argv.index('--width') + 1]) if '--width' in sys.argv else 1240
    enhance(sys.argv[1], sys.argv[2], width)
