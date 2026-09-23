# ==============================================================================
# Awlad Yahya Factory - Product Catalog Sync Script
# Synchronizes Products and Categories from Excel Database into Web Catalog
# Database: data/Awlad_Yahya_Product_Catalog_Database.xlsx
# Outputs:  js/products-data.js & data/products.json
# ==============================================================================

param(
    [string]$ExcelPath = "D:\website\website\data\Awlad_Yahya_Product_Catalog_Database.xlsx",
    [string]$WebRoot = "D:\website\website"
)

$ErrorActionPreference = "Stop"

Write-Host ">>> Starting Catalog Synchronization..." -ForegroundColor Cyan
Write-Host "Excel Source: $ExcelPath"
Write-Host "Web Root:     $WebRoot"

if (!(Test-Path $ExcelPath)) {
    throw "Excel file not found at: $ExcelPath"
}

# Temporary extraction directory
$tempDir = Join-Path $env:TEMP ("awlad_yahya_excel_" + [guid]::NewGuid().ToString("N"))
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }

try {
    # 1. Unzip Excel archive
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($ExcelPath, $tempDir)

    # 2. Parse Shared Strings
    $sharedStrings = @()
    $sstPath = Join-Path $tempDir "xl\sharedStrings.xml"
    if (Test-Path $sstPath) {
        $sstXml = New-Object System.Xml.XmlDocument
        $sstXml.Load($sstPath)
        foreach ($si in $sstXml.sst.si) {
            $sharedStrings += $si.InnerText
        }
    }
    Write-Host "Loaded $($sharedStrings.Count) shared strings." -ForegroundColor Green

    # 3. Parse Workbook relationships to find sheet files
    $wbRels = New-Object System.Xml.XmlDocument
    $wbRels.Load((Join-Path $tempDir "xl\_rels\workbook.xml.rels"))
    $rels = @{}
    foreach ($rel in $wbRels.Relationships.Relationship) {
        $rels[$rel.Id] = $rel.Target
    }

    $wbXml = New-Object System.Xml.XmlDocument
    $wbXml.Load((Join-Path $tempDir "xl\workbook.xml"))
    $sheetFiles = @{}
    foreach ($sheet in $wbXml.workbook.sheets.sheet) {
        $target = $rels[$sheet.'id']
        $sheetFiles[$sheet.name] = Join-Path $tempDir "xl\$target"
    }

    # Helper function to read sheet rows
    function Read-ExcelSheet($sheetPath) {
        if (!(Test-Path $sheetPath)) { return @() }
        $xml = New-Object System.Xml.XmlDocument
        $xml.Load($sheetPath)
        $rows = $xml.worksheet.sheetData.row
        if ($null -eq $rows -or $rows.Count -lt 1) { return @() }

        $headers = [ordered]@{}
        foreach ($c in $rows[0].c) {
            $col = $c.r -replace '\d+', ''
            $val = ""
            if ($c.t -eq "s") {
                $val = $sharedStrings[[int]$c.v]
            } elseif ($c.v) {
                $val = $c.v
            }
            $headers[$col] = $val.Trim()
        }

        $records = @()
        for ($i = 1; $i -lt $rows.Count; $i++) {
            $r = $rows[$i]
            $record = [ordered]@{}
            foreach ($col in $headers.Keys) {
                $record[$headers[$col]] = ""
            }
            foreach ($c in $r.c) {
                $col = $c.r -replace '\d+', ''
                if ($headers.Contains($col)) {
                    $hName = $headers[$col]
                    $val = ""
                    if ($c.t -eq "s") {
                        $val = $sharedStrings[[int]$c.v]
                    } elseif ($c.v) {
                        $val = $c.v
                    }
                    $record[$hName] = $val
                }
            }
            $records += $record
        }
        return $records
    }

    # Helper function to normalize and verify image paths
    function Normalize-WebImage($rawPath) {
        if ([string]::IsNullOrWhiteSpace($rawPath)) { return "" }
        
        $p = $rawPath.Trim().Trim('"').Trim("'")
        $p = $p -replace '\\', '/'
        
        # Strip drive letter and root project path
        $p = $p -replace '^[A-Za-z]:/website/website/', ''
        $p = $p -replace '^/assets/', 'assets/'
        $p = $p.TrimStart('/')
        
        # Check physical existence
        $diskPath = Join-Path $WebRoot ($p -replace '/', '\')
        if (Test-Path $diskPath) {
            return $p
        }
        
        # Check if file exists with .png or .jpg appended (e.g. main.webp.png)
        if (Test-Path "$diskPath.png") {
            Copy-Item "$diskPath.png" $diskPath -ErrorAction SilentlyContinue
            if (Test-Path $diskPath) { return $p }
            return "$p.png"
        }
        if (Test-Path "$diskPath.jpg") {
            Copy-Item "$diskPath.jpg" $diskPath -ErrorAction SilentlyContinue
            if (Test-Path $diskPath) { return $p }
            return "$p.jpg"
        }

        # Check directory for any matching file
        $parentDir = Split-Path $diskPath -Parent
        if (Test-Path $parentDir) {
            $leaf = Split-Path $diskPath -Leaf
            $candidates = Get-ChildItem -File $parentDir -ErrorAction SilentlyContinue
            foreach ($cand in $candidates) {
                if ($cand.Name.StartsWith($leaf)) {
                    $relParent = Split-Path $p -Parent
                    return "$relParent/$($cand.Name)" -replace '\\', '/'
                }
            }
        }
        
        return $p
    }

    # 4. Parse Categories
    Write-Host "Parsing Categories sheet..." -ForegroundColor Yellow
    $rawCats = Read-ExcelSheet $sheetFiles["Categories"]
    $cleanCategories = @()

    foreach ($cat in $rawCats) {
        $cOrder = 999
        if ($cat["DisplayOrder"] -match '^\d+$') {
            $cOrder = [int]$cat["DisplayOrder"]
        }

        $cId = $cat["CategoryID"]
        if ([string]::IsNullOrWhiteSpace($cId)) { continue }

        $cName = $cat["CategoryName"]
        $cDesc = ""
        if ($cat["CategoryDescription"]) { $cDesc = $cat["CategoryDescription"].Trim() }
        
        $cImg = Normalize-WebImage $cat["CategoryImage"]
        $cActive = $true
        if ($cat["Active"] -eq "No") { $cActive = $false }
        
        $cFeatured = $false
        if ($cat["Featured"] -eq "Yes") { $cFeatured = $true }

        $cSeoTitle = ""
        if ($cat["SEOTitle"]) { $cSeoTitle = $cat["SEOTitle"].Trim() }
        
        $cSeoDesc = ""
        if ($cat["SEODescription"]) { $cSeoDesc = $cat["SEODescription"].Trim() }

        $cleanCategories += [PSCustomObject]@{
            id = $cId
            name = $cName
            description = $cDesc
            image = $cImg
            displayOrder = $cOrder
            active = $cActive
            featured = $cFeatured
            seoTitle = $cSeoTitle
            seoDescription = $cSeoDesc
        }
    }
    $cleanCategories = $cleanCategories | Sort-Object displayOrder
    Write-Host "Processed $($cleanCategories.Count) categories." -ForegroundColor Green

    # 5. Parse Products
    Write-Host "Parsing Products sheet..." -ForegroundColor Yellow
    $rawProds = Read-ExcelSheet $sheetFiles["Products"]
    $cleanProducts = @()

    foreach ($prod in $rawProds) {
        $productId = $prod["ProductID"]
        if ([string]::IsNullOrWhiteSpace($productId)) { continue }

        $pOrder = 999
        if ($prod["DisplayOrder"] -match '^\d+$') {
            $pOrder = [int]$prod["DisplayOrder"]
        }

        $pCode = $prod["ProductCode"]
        if ([string]::IsNullOrWhiteSpace($pCode)) { $pCode = $productId }

        $pName = $prod["ProductName"]
        if ([string]::IsNullOrWhiteSpace($pName)) {
            $pName = "AY-$pCode"
        }

        $pCatId = $prod["CategoryID"]
        $pCatName = $prod["CategoryName"]
        if ([string]::IsNullOrWhiteSpace($pCatName)) {
            $matchingCat = $cleanCategories | Where-Object { $_.id -eq $pCatId } | Select-Object -First 1
            if ($matchingCat) { $pCatName = $matchingCat.name } else { $pCatName = "" }
        }

        $pShort = ""
        if ($prod["ShortDescription"]) { $pShort = $prod["ShortDescription"].Trim() }

        $pFull = ""
        if ($prod["FullDescription"]) { $pFull = $prod["FullDescription"].Trim() }

        $pStatus = "Available"
        if ($prod["ProductStatus"]) { $pStatus = $prod["ProductStatus"].Trim() }

        $pFeatured = "No"
        if ($prod["Featured"] -eq "Yes") { $pFeatured = "Yes" }

        $pPrice = ""
        if ($prod["Price"]) { $pPrice = $prod["Price"].Trim() }

        $pShowPrice = "No"
        if ($prod["ShowPrice"] -eq "Yes") { $pShowPrice = "Yes" }

        # Images
        $mainImg = Normalize-WebImage $prod["MainImage"]
        $img2 = Normalize-WebImage $prod["Image2"]
        $img3 = Normalize-WebImage $prod["Image3"]
        $img4 = Normalize-WebImage $prod["Image4"]
        $img5 = Normalize-WebImage $prod["Image5"]

        $imagesList = @()
        if ($mainImg) { $imagesList += $mainImg }
        if ($img2) { $imagesList += $img2 }
        if ($img3) { $imagesList += $img3 }
        if ($img4) { $imagesList += $img4 }
        if ($img5) { $imagesList += $img5 }

        # Fallback image if main is missing
        if ($imagesList.Count -eq 0) {
            if ($pCatId -eq "KC") { $mainImg = "assets/images/logo.svg" }
            elseif ($pCatId -eq "SH") { $mainImg = "assets/images/chair-shampoo-basin.svg" }
            elseif ($pCatId -eq "CH") { $mainImg = "assets/images/chaise-longue-spa.svg" }
            elseif ($pCatId -eq "EQ") { $mainImg = "assets/images/salon-fixtures-trolley.svg" }
            else { $mainImg = "assets/images/chair-mens-classic.svg" }
            $imagesList += $mainImg
        }

        $pSpecs = ""
        if ($prod["Specifications"]) { $pSpecs = $prod["Specifications"].Trim() }

        $pMat = ""
        if ($prod["Materials"]) { $pMat = $prod["Materials"].Trim() }

        $pColors = ""
        if ($prod["AvailableColors"]) { $pColors = $prod["AvailableColors"].Trim() }

        $pCustom = "Yes"
        if ($prod["CustomizationAvailable"] -eq "No") { $pCustom = "No" }

        $pMsg = ""
        if ($prod["WhatsAppMessage"]) { $pMsg = $prod["WhatsAppMessage"].Trim() }

        $pSeoTitle = ""
        if ($prod["SEOTitle"]) { $pSeoTitle = $prod["SEOTitle"].Trim() }

        $pSeoDesc = ""
        if ($prod["SEODescription"]) { $pSeoDesc = $prod["SEODescription"].Trim() }

        $pKeywords = ""
        if ($prod["Keywords"]) { $pKeywords = $prod["Keywords"].Trim() }

        $cleanProducts += [PSCustomObject]@{
            id = $productId
            code = $pCode
            name = $pName
            category = $pCatId
            categoryName = $pCatName
            shortDesc = $pShort
            fullDescription = $pFull
            status = $pStatus
            featured = $pFeatured
            displayOrder = $pOrder
            price = $pPrice
            showPrice = $pShowPrice
            image = $mainImg
            images = $imagesList
            specifications = $pSpecs
            materials = $pMat
            availableColors = $pColors
            customizationAvailable = $pCustom
            whatsAppMessage = $pMsg
            seoTitle = $pSeoTitle
            seoDescription = $pSeoDesc
            keywords = $pKeywords
        }
    }
    $cleanProducts = $cleanProducts | Sort-Object displayOrder
    Write-Host "Processed $($cleanProducts.Count) products." -ForegroundColor Green

    # 6. Generate data/products.json
    $jsonOutputDir = Join-Path $WebRoot "data"
    if (!(Test-Path $jsonOutputDir)) { New-Item -ItemType Directory -Path $jsonOutputDir -Force | Out-Null }
    $jsonFilePath = Join-Path $jsonOutputDir "products.json"

    $catalogObject = [ordered]@{
        categories = $cleanCategories
        products = $cleanProducts
        metadata = [ordered]@{
            totalCategories = $cleanCategories.Count
            totalProducts = $cleanProducts.Count
            syncedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            sourceFile = (Split-Path $ExcelPath -Leaf)
        }
    }

    $jsonContent = $catalogObject | ConvertTo-Json -Depth 6
    [System.IO.File]::WriteAllText($jsonFilePath, $jsonContent, [System.Text.Encoding]::UTF8)
    Write-Host "Exported JSON to: $jsonFilePath" -ForegroundColor Cyan

    # 7. Generate js/products-data.js
    $jsOutputDir = Join-Path $WebRoot "js"
    if (!(Test-Path $jsOutputDir)) { New-Item -ItemType Directory -Path $jsOutputDir -Force | Out-Null }
    $jsFilePath = Join-Path $jsOutputDir "products-data.js"

    $jsProductsJson = $cleanProducts | ConvertTo-Json -Depth 6
    $jsCategoriesJson = $cleanCategories | ConvertTo-Json -Depth 6

    $dateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine("// =============================================================================")
    [void]$sb.AppendLine("// Awlad Yahya Factory - Synchronized Product Catalog Data")
    [void]$sb.AppendLine("// Auto-generated from: data/Awlad_Yahya_Product_Catalog_Database.xlsx")
    [void]$sb.AppendLine("// Generated at: $dateStr")
    [void]$sb.AppendLine("// =============================================================================")
    [void]$sb.AppendLine()
    [void]$sb.AppendLine("window.categoriesData = $jsCategoriesJson;")
    [void]$sb.AppendLine()
    [void]$sb.AppendLine("window.productsData = $jsProductsJson;")

    [System.IO.File]::WriteAllText($jsFilePath, $sb.ToString(), [System.Text.Encoding]::UTF8)
    Write-Host "Exported JS Data to: $jsFilePath" -ForegroundColor Cyan

    Write-Host ">>> Catalog synchronization completed successfully!" -ForegroundColor Green
}
finally {
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    }
}
