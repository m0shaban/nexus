# NEXUS GitHub Upload Script v2.0 (PowerShell)
# Developer: Mohamed Shaban
# Version: v2.0 - Updated with advanced icons and UI enhancements
# Purpose: Upload NEXUS project to GitHub with commercial rights protection

Write-Host "NEXUS - GitHub Upload Script v2.0" -ForegroundColor Green
Write-Host "Updates: Advanced icons + UI enhancements" -ForegroundColor Magenta
Write-Host "(c) 2025 Mohamed Shaban - All rights reserved" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

# Check Git availability
try {
    git --version | Out-Null
    Write-Host "Git is available" -ForegroundColor Green
} catch {
    Write-Host "Error: Git is not installed" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check current directory
if (-Not (Test-Path "package.json")) {
    Write-Host "Error: Must run script from project directory" -ForegroundColor Red
    exit 1
}

Write-Host "Requirements check completed" -ForegroundColor Green

# Repository name
$REPO_NAME = "nexus"
Write-Host "Repository name: $REPO_NAME" -ForegroundColor Blue

# Get username from user
Write-Host ""
$GITHUB_USERNAME = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($GITHUB_USERNAME)) {
    Write-Host "Error: GitHub username is required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting upload process..." -ForegroundColor Yellow

# Initialize Git (if not already initialized)
if (-Not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Blue
    git init
    git add .
    
    $commitMessage = "NEXUS v2.0: Advanced Icons and Enhanced UI

Major Updates v2.0:
- Advanced Neural Network Icons with animations
- AdvancedLogosIcon component (neural, quantum, matrix variants)
- Enhanced visual effects and CSS animations
- Quantum interference and neural pulse effects
- Spin-slow animations and gradient enhancements

Logos AI Enhancements:
- Unified welcome message across all components
- Specialized strategic consultation focus
- Enhanced floating chat with neural animations
- Smooth transitions and hover effects

Tech Stack v2.0:
- Next.js 15.3.3 + TypeScript
- Supabase Database with RLS
- NVIDIA AI Integration
- Tailwind CSS + Advanced Animations
- Neural Network Visual Effects

Commercial Rights Protected:
- (c) 2025 Mohamed Shaban
- Commercial use requires paid license
- Contact: ENG.MOHAMED0SHABAN@GMAIL.COM

Contact Information:
- Name: Mohamed Shaban
- Phone: +201121891913
- Email: ENG.MOHAMED0SHABAN@GMAIL.COM
- LinkedIn: https://www.linkedin.com/in/moshabann/

Ready for production deployment with enhanced UI"
    
    git commit -m $commitMessage
}

# Add remote repository
Write-Host "Adding remote repository..." -ForegroundColor Blue
try {
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>$null
} catch {
    # Remote already exists, continue
}

# Set main branch
Write-Host "Setting main branch..." -ForegroundColor Blue
git branch -M main

# Push project
Write-Host "Pushing project to GitHub..." -ForegroundColor Blue
try {
    git push -u origin main
    
    # Create v2.0 tag
    Write-Host "Creating v2.0 release tag..." -ForegroundColor Blue
    $tagMessage = "NEXUS v2.0: Advanced Neural Icons and Enhanced UI

Major Features:
- Advanced LogosIcon with neural network animations
- Quantum and Matrix visual effects
- Enhanced CSS animations (spin-slow, neural-pulse)
- Unified Logos AI experience
- Modern gradient effects (conic, radial)

(c) 2025 Mohamed Shaban - Commercial License Required
Contact: ENG.MOHAMED0SHABAN@GMAIL.COM"

    git tag -a "v2.0" -m $tagMessage
    git push origin v2.0
    
    Write-Host ""
    Write-Host "NEXUS v2.0 uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository link:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor White
    Write-Host ""
    
    # Special Vercel update alert
    Write-Host "IMPORTANT - Vercel Update Alert:" -ForegroundColor Red
    Write-Host "   If you have a deployed version on Vercel, make sure to:" -ForegroundColor Yellow
    Write-Host "   1. Redeploy on Vercel to update new icons" -ForegroundColor White
    Write-Host "   2. Verify advanced icons (Neural Network) are showing" -ForegroundColor White
    Write-Host "   3. Test new animations and visual effects" -ForegroundColor White
    Write-Host "   4. Check https://vercel.com/dashboard for deployment" -ForegroundColor White
    Write-Host ""
    
    Write-Host "v2.0 New Features:" -ForegroundColor Magenta
    Write-Host "   Neural Network animated icons" -ForegroundColor White
    Write-Host "   Quantum and Matrix effects" -ForegroundColor White
    Write-Host "   Advanced CSS animations (spin-slow, neural-pulse)" -ForegroundColor White
    Write-Host "   Custom gradients (conic, radial)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Add repository description with 'v2.0 Advanced Icons'" -ForegroundColor White
    Write-Host "   2. Create Release v2.0 with changelog" -ForegroundColor White
    Write-Host "   3. Update Vercel from GitHub" -ForegroundColor White
    Write-Host "   4. Review docs/LOGOS_ICONS_ENHANCEMENT.md" -ForegroundColor White
    Write-Host ""
    Write-Host "For commercial use contact:" -ForegroundColor Magenta
    Write-Host "   Mohamed Shaban - ENG.MOHAMED0SHABAN@GMAIL.COM" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "Failed to upload project!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "   1. Make sure to create repository on GitHub first:" -ForegroundColor White
    Write-Host "      https://github.com/new" -ForegroundColor White
    Write-Host "   2. Repository name: $REPO_NAME" -ForegroundColor White
    Write-Host "   3. Make sure Git is configured:" -ForegroundColor White
    Write-Host "      git config --global user.name 'Your Name'" -ForegroundColor White
    Write-Host "      git config --global user.email 'your@email.com'" -ForegroundColor White
    Write-Host "   4. Check UPLOAD_TO_GITHUB.md for details" -ForegroundColor White
    Write-Host ""
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "NEXUS v2.0 - Enhanced with Neural Network Icons" -ForegroundColor Magenta
Write-Host "(c) 2025 Mohamed Shaban - All rights reserved" -ForegroundColor Yellow

# Pause to show results
Read-Host "Press Enter to continue..."
