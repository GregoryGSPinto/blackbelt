# BlackBelt App Screenshots Specification

## Required Screenshots

### App Store (iOS)

| Device | Resolution | Required |
|--------|-----------|----------|
| iPhone 15 Pro Max (6.7") | 1290 x 2796 | Yes |
| iPhone 14 Plus (6.5") | 1284 x 2778 | Yes |
| iPhone 8 Plus (5.5") | 1242 x 2208 | Yes |
| iPad Pro 12.9" | 2048 x 2732 | Yes |

### Google Play (Android)

| Device | Resolution | Required |
|--------|-----------|----------|
| Phone | 1080 x 1920 | Yes |
| 7" Tablet | 1200 x 1920 | Yes |
| 10" Tablet | 1600 x 2560 | Yes |

## Screens to Capture

1. **Login** - Landing page with plans and login form
2. **Dashboard Admin** - Administrative dashboard with metrics and charts
3. **Check-in QR** - QR Code check-in screen
4. **Progresso Aluno** - Student progress with belt progression and achievements
5. **Dashboard Kids** - Gamified kids interface with adventures and medals
6. **Loja** - Integrated marketplace/shop

## File Naming Convention

```
{platform}/{device}/{number}_{screen_name}.png
```

Example:
```
appstore/6.7/01_login.png
appstore/6.7/02_admin_dashboard.png
appstore/6.5/01_login.png
googleplay/phone/01_login.png
googleplay/7-tablet/01_login.png
```

## Generation

Use `scripts/capture-screenshots.sh` or manually capture from the running app at each required resolution.
