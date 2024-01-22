class ImageData {
    constructor(imageSrc, camera, dateTime, shootingParam, artist) {
        this.imageSrc = imageSrc;
        this.camera = camera;
        this.dateTime = dateTime;
        this.shootingParam = shootingParam;
        this.artist = artist;
    }
}

let globalImages = [];

/**
 * Get the Exif information of the photo.
 *
 * @param {HTMLElement} img - The photo
 * @param callback
 */
function getExifData(img, callback) {
    var exifData = new Map();
    EXIF.getData(img, function () {
        const cameraMake = String(EXIF.getTag(this, "Make"));
        const cameraModel = String(EXIF.getTag(this, "Model"));
        const dateTime = String(EXIF.getTag(this, "DateTime"));
        const fNumber = String(EXIF.getTag(this, "FNumber"));
        const _exposureTime = EXIF.getTag(this, "ExposureTime");
        const ISOSpeedRatings = String(EXIF.getTag(this, "ISOSpeedRatings"));
        const focalLength = String(EXIF.getTag(this, "FocalLength"));
        const artist = String(EXIF.getTag(this, "Artist") || "ANONYMOUS");

        // 构造包含提取信息的字典
        let camera;
        if (cameraModel.includes(cameraMake)) {
            camera = cameraModel;
        } else {
            camera = cameraMake + " " + cameraModel;
        }

        const exposureTime = String(_exposureTime.numerator) + "/" + String(_exposureTime.denominator);

        const shootingParam = focalLength + "mm " + "f/" + fNumber + " " + exposureTime + " ISO" + ISOSpeedRatings;
        exifData.set("camera", camera);
        exifData.set("dateTime", dateTime);
        exifData.set("shootingParam", "f/" + shootingParam);
        exifData.set("artist", "PHOTO BY " + artist);

        // 将字典传递给回调函数
        callback(exifData);
    });
}

/**
 * Add borders and watermarks to the image.
 *
 * @returns {HTMLElement} canvas
 */
function processImage(img) {
    const index = globalImages.findIndex(imageData => imageData.imageSrc === img.src);
    let imageWidth = img.naturalWidth;
    let imageHeight = img.naturalHeight;
    // 创建一个新的Image对象
    let canvas = document.getElementById("myCanvas");
    var extraHeight;
    if (imageWidth > imageHeight) {
        extraHeight = imageHeight / 8;
    } else {
        extraHeight = imageWidth / 8;
    }
    canvas.width = imageWidth;
    canvas.height = imageHeight + extraHeight;

    // Get the 2D rendering context
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add an image to the canvas
    context.drawImage(img, 0, 0, imageWidth, imageHeight);

    // Set watermark information
    if (index < 0) {
        getExifData(img, function (exifData) {
            const lensInfo = exifData.get("shootingParam");
            let watermarkList = [
                // text, left, size, top, color
                {
                    text: exifData.get("camera"),
                    left: imageWidth / 40,
                    textSize: "bold " + extraHeight / 5,
                    top: imageHeight + (extraHeight / 20) * 9,
                    textColor: "black"
                },
                {
                    text: exifData.get("dateTime"),
                    left: imageWidth / 40,
                    textSize: extraHeight / 6,
                    top: imageHeight + (extraHeight / 20) * 14,
                    textColor: "gray"
                },
                {
                    text: lensInfo,
                    left: imageWidth - lensInfo.length * (extraHeight / 5) * 0.6,
                    textSize: "bold " + extraHeight / 5,
                    top: imageHeight + (extraHeight / 20) * 9,
                    textColor: "black"
                },
                {
                    text: exifData.get("artist"),
                    left: imageWidth - lensInfo.length * (extraHeight / 5) * 0.6,
                    textSize: extraHeight / 6,
                    top: imageHeight + (extraHeight / 20) * 14,
                    textColor: "gray"
                }
            ];//lensInfo.length * (extraHeight / 5)
            // Add text to the canvas
            for (var i = 0; i < watermarkList.length; i++) {
                context.fillStyle = watermarkList[i].textColor;
                context.font = watermarkList[i].textSize + "px Arial";
                context.fillText(watermarkList[i].text, watermarkList[i].left, watermarkList[i].top);
            }

            // Draw a dividing line
            context.beginPath();
            context.moveTo(imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 60, imageHeight + (extraHeight / 20) * 5.5)
            context.lineTo(imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 60, imageHeight + (extraHeight / 20) * 15)
            context.strokeStyle = "lightgray";
            context.lineWidth = 5;
            context.stroke();
            context.closePath();

            // Add a logo
            var logoImage = new Image();
            logoImage.src = "logos/nikon-1.png"
            logoImage.onload = function () {
                var aspectRatio = logoImage.width / logoImage.height;
                var newWidth = (extraHeight / 20) * 9.5 * aspectRatio;
                context.drawImage(logoImage, imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 180 - (extraHeight / 20) * 8, imageHeight + (extraHeight / 20) * 5.5, newWidth, (extraHeight / 20) * 9.5);
            }
        });
    } else {
        const lensInfo = globalImages[index].shootingParam;
        let watermarkList = [
            // text, left, size, top, color
            {
                text: globalImages[index].camera,
                left: imageWidth / 40,
                textSize: "bold " + extraHeight / 5,
                top: imageHeight + (extraHeight / 20) * 9,
                textColor: "black"
            },
            {
                text: globalImages[index].dateTime,
                left: imageWidth / 40,
                textSize: extraHeight / 6,
                top: imageHeight + (extraHeight / 20) * 14,
                textColor: "gray"
            },
            {
                text: lensInfo,
                left: imageWidth - lensInfo.length * (extraHeight / 5) * 0.6,
                textSize: "bold " + extraHeight / 5,
                top: imageHeight + (extraHeight / 20) * 9,
                textColor: "black"
            },
            {
                text: globalImages[index].artist,
                left: imageWidth - lensInfo.length * (extraHeight / 5) * 0.6,
                textSize: extraHeight / 6,
                top: imageHeight + (extraHeight / 20) * 14,
                textColor: "gray"
            }
        ];//lensInfo.length * (extraHeight / 5)
        // Add text to the canvas
        for (var i = 0; i < watermarkList.length; i++) {
            context.fillStyle = watermarkList[i].textColor;
            context.font = watermarkList[i].textSize + "px Arial";
            context.fillText(watermarkList[i].text, watermarkList[i].left, watermarkList[i].top);
        }

        // Draw a dividing line
        context.beginPath();
        context.moveTo(imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 60, imageHeight + (extraHeight / 20) * 5.5)
        context.lineTo(imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 60, imageHeight + (extraHeight / 20) * 15)
        context.strokeStyle = "lightgray";
        context.lineWidth = 5;
        context.stroke();
        context.closePath();

        // Add a logo
        var logoImage = new Image();
        logoImage.src = "logos/nikon-1.png";
        logoImage.onload = function () {
            var aspectRatio = logoImage.width / logoImage.height;
            var newWidth = (extraHeight / 20) * 9.5 * aspectRatio;
            context.drawImage(logoImage, imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 180 - (extraHeight / 20) * 8, imageHeight + (extraHeight / 20) * 5.5, newWidth, (extraHeight / 20) * 9.5);
        }
    }
}

function processImage2(img, callback) {
    var dataURL;
    const index = globalImages.findIndex(imageData => imageData.imageSrc === img.src);
    let imageWidth = img.naturalWidth;
    let imageHeight = img.naturalHeight;
    // 创建一个新的Image对象
    let canvas = document.createElement("canvas");
    var extraHeight;
    if (imageWidth > imageHeight) {
        extraHeight = imageHeight / 8;
    } else {
        extraHeight = imageWidth / 8;
    }
    canvas.width = imageWidth;
    canvas.height = imageHeight + extraHeight;

    // Get the 2D rendering context
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add an image to the canvas
    context.drawImage(img, 0, 0, imageWidth, imageHeight);

    // Set watermark information
    const lensInfo = globalImages[index].shootingParam;
    let watermarkList = [
        // text, left, size, top, color
        {
            text: globalImages[index].camera,
            left: imageWidth / 40,
            textSize: "bold " + extraHeight / 5,
            top: imageHeight + (extraHeight / 20) * 9,
            textColor: "black"
        },
        {
            text: globalImages[index].dateTime,
            left: imageWidth / 40,
            textSize: extraHeight / 6,
            top: imageHeight + (extraHeight / 20) * 14,
            textColor: "gray"
        },
        {
            text: lensInfo,
            left: imageWidth - lensInfo.length * (extraHeight / 5) * 0.6,
            textSize: "bold " + extraHeight / 5,
            top: imageHeight + (extraHeight / 20) * 9,
            textColor: "black"
        },
        {
            text: globalImages[index].artist,
            left: imageWidth - lensInfo.length * (extraHeight / 5) * 0.6,
            textSize: extraHeight / 6,
            top: imageHeight + (extraHeight / 20) * 14,
            textColor: "gray"
        }
    ];//lensInfo.length * (extraHeight / 5)
    // Add text to the canvas
    for (var i = 0; i < watermarkList.length; i++) {
        context.fillStyle = watermarkList[i].textColor;
        context.font = watermarkList[i].textSize + "px Arial";
        context.fillText(watermarkList[i].text, watermarkList[i].left, watermarkList[i].top);
    }

    // Draw a dividing line
    context.beginPath();
    context.moveTo(imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 60, imageHeight + (extraHeight / 20) * 5.5)
    context.lineTo(imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 60, imageHeight + (extraHeight / 20) * 15)
    context.strokeStyle = "lightgray";
    context.lineWidth = 5;
    context.stroke();
    context.closePath();

    // Add a logo
    var logoImage = new Image();
    logoImage.src = "logos/nikon-1.png";
    logoImage.onload = function () {
        var aspectRatio = logoImage.width / logoImage.height;
        var newWidth = (extraHeight / 20) * 9.5 * aspectRatio;
        context.drawImage(logoImage, imageWidth - lensInfo.length * (extraHeight / 5) * 0.6 - 180 - (extraHeight / 20) * 8, imageHeight + (extraHeight / 20) * 5.5, newWidth, (extraHeight / 20) * 9.5);
        dataURL = canvas.toDataURL();
        callback(dataURL);
    }
}

function handleFileSelect(event) {
    const fileList = event.target.files;
    const imageList = document.getElementById("imageList");

    // Clean the list
    if (fileList.length > 0) {
        imageList.innerHTML = "";
        var importYourAwesomePhotos = document.getElementById("importYourAwesomePhotos");
        importYourAwesomePhotos.style.display = "none";
        globalImages = [];
    }
    for (const file of fileList) {
        if (file.type.startsWith("image/")) {
            let imageSrc = URL.createObjectURL(file);
            const listItem = document.createElement("label");
            listItem.classList.add("mdui-list-item");
            listItem.classList.add("mdui-ripple");
            listItem.innerHTML = `
                <img src="${imageSrc}" class="mdui-center image-item" alt="${file.name}">
            `;
            imageList.appendChild(listItem);
            let img = new Image();
            img.src = imageSrc;
            img.onload = function () {
                getExifData(img, function (exifData) {
                    let imageData = new ImageData(imageSrc, exifData.get("camera"), exifData.get("dateTime"), exifData.get("shootingParam"), exifData.get("artist"));
                    globalImages.push(imageData);
                });
            }
        }
    }
    // 默认选中第一个项目
    const firstItem = imageList.querySelector('.mdui-list-item');
    if (firstItem) {
        // 调用 handleItemClick 处理选中第一个项目后的逻辑
        handleItemClick({target: firstItem});
    }
}

function handleItemClick(event) {
    // 获取点击的列表项
    const listItem = event.target.closest('.mdui-list-item');

    // 如果点击的是列表项
    if (listItem) {
        // 移除其他列表项的选中状态
        const allItems = document.querySelectorAll('.mdui-list-item');
        allItems.forEach(item => item.classList.remove('mdui-list-item-active'));

        // 将点击的列表项设为选中状态
        listItem.classList.add('mdui-list-item-active');

        // 处理选择的图片，例如可以在这里获取选择的图片信息
        const selectedImage = listItem.querySelector('img');
        let blurImage = document.getElementById("blurImage");
        let img = new Image();
        img.src = selectedImage.src;
        img.onload = function () {
            processImage(img);
            // 元数据展示
            getExifData(selectedImage, function (exifData) {
                let cameraInput = document.getElementById("cameraInput");
                let dateTimeInput = document.getElementById("dateTimeInput");
                let shootingParamInput = document.getElementById("shootingParamInput");
                let artistInput = document.getElementById("artistInput");

                cameraInput.value = exifData.get("camera");
                dateTimeInput.value = exifData.get("dateTime");
                shootingParamInput.value = exifData.get("shootingParam");
                artistInput.value = exifData.get("artist");
                mdui.updateTextFields();
            });
        };
        blurImage.src = selectedImage.src;
    }
}

function handleUpdateClick() {
    let cameraInput = document.getElementById("cameraInput");
    let dateTimeInput = document.getElementById("dateTimeInput");
    let shootingParamInput = document.getElementById("shootingParamInput");
    let artistInput = document.getElementById("artistInput");

    let blurImg = document.getElementById("blurImage");
    const index = globalImages.findIndex(imageData => imageData.imageSrc === blurImg.src);
    globalImages[index].camera = cameraInput.value;
    globalImages[index].dateTime = dateTimeInput.value;
    globalImages[index].shootingParam = shootingParamInput.value;
    globalImages[index].artist = artistInput.value;
    let img = new Image();
    img.src = blurImg.src;
    img.onload = function () {
        processImage(img);
    }
}

function handleDownloadClick() {
    // Convert the canvas content to a data URL
    let canvas = document.getElementById("myCanvas");
    const dataURL = canvas.toDataURL();

    // Create a temporary link element and trigger a download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas_image.png"; // Set the desired file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleExportAllClick() {
    var progressContainer = document.getElementById("progressContainer");
    progressContainer.style.visibility = "visible";
    var images = document.getElementById("imageList").getElementsByTagName("img");
    var zip = new JSZip();
    if (images.length <= 0) {
        progressContainer.style.visibility = "hidden";
        mdui.snackbar({
            message: '😡 There are no photos!',
            position: 'top'
        });
    }

    var count = 0;

    function downloadZip() {
        zip.generateAsync({type: "blob"}).then(function (content) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = "photos-with-watermark.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    function processImage3(index) {
        var img = new Image();
        img.src = images[index].src;
        img.onload = function () {
            processImage2(img, function (dataURL) {
                zip.file("image" + index + ".jpg", dataURL.split("base64,")[1], {base64: true});
                count++;
                if (count === images.length) {
                    // All images processed, trigger zip download
                    progressContainer.style.visibility = "hidden";
                    downloadZip();
                    mdui.snackbar({
                        message: '🥳 Export Successfully!',
                        position: 'top'
                    });
                }
            });
        };
    }

    for (var i = 0; i < images.length; i++) {
        processImage3(i);
    }

}

document.addEventListener("DOMContentLoaded", function () {
    // Wait for the DOM to be ready

});

document.getElementById("downloadBtn").addEventListener("click", handleDownloadClick);

document.getElementById("fileInput").addEventListener("change", handleFileSelect);

document.getElementById("importBtn").addEventListener("click", function () {
    var fileInput = document.getElementById("fileInput");
    fileInput.click();
})

document.getElementById('imageList').addEventListener('click', handleItemClick);

document.getElementById("updateBtn").addEventListener("click", handleUpdateClick);

document.getElementById("exportAllBtn").addEventListener("click", handleExportAllClick);

mdui.mutation();
