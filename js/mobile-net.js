let model;
const CLASS_EXPLANATIONS = [
  "akiec: Actinic Keratoses/Bowen's Disease",
  "bcc: Basal Cell Carcinoma",
  "bkl: Benign Keratosis-like Lesions",
  "df: Dermatofibroma",
  "mel: Melanoma",
  "nv: Melanocytic Nevi",
  "vasc: Vascular Lesions",
];

const CLASS_DETAILS = [
  // akiec
  "Actinic Keratoses/Bowen's Disease adalah bercak kasar bersisik pada kulit kasar yang disebabkan oleh paparan sinar UV dari sinar matahari selama bertahun-tahun dan biasanya terjadi pada usia lebih dari 40 tahun, namun tidak menutup kemungkinan dapat terjadi pada usia yang lebih muda. Seseorang dengan gangguan keratosis aktinik berkemungkinan besar dapat menimbulkan masalah yang lebih banyak di masa depan dan dapat meningkatkan risiko kanker kulit yang lebih tinggi seperti karsinoma sel skuamosa (SCC), yaitu penyakit kulit yang dapat menimbulkan masalah lebih banyak.",
  // bcc
  "Basal Cell Carcinoma adalah Karsinoma sel basal/bcc adalah jenis kanker kulit yang ditandai dengan adanya benjolan yang mudah berdarah. Benjolan tersebut timbul pada bagian tubuh yang sering terpapar sinar matahari dan umumnya tidak terasa nyeri, serta dapat bertumbuh seiring waktu. Kanker ini termasuk jenis kanker kulit yang paling sering terjadi dari semua kasus, namun cenderung tumbuh lambat dan tidak menimbulkan gejala dalam waktu lama. Secara umum, karsinoma sel basal tidak menyebar ke organ lain. Akan tetapi, apabila tidak ditangani secara tepat, kanker ini dapat menyebar ke organ dan jaringan tubuh lainnya.",
  // bkl
  "Benign Keratosis-like Lesions adalah Keratosis seboroik, solar lentigo, dan keratosis mirip lichen planus, berkorelasi dengan keratosis seboroik atau solar lentigo dengan regresi dan pembengkakan. Semuanya merupakan contoh dari keratosis jinak.",
  // df
  "Dermatofibroma adalah suatu kondisi dimana kulit tampak menumbuhkan jaringan yang berukuran kecil, bulat, dan tidak berbahaya. Penyebab munculnya dermatofibroma adalah pertumbuhan yang berlebih dari campuran berbagai jenis sel pada lapisan kulit (dermis). Sementara penyebab utamanya, bahkan peneliti medis masih belum mengetahui penyebab pastinya. Beberapa peneliti memiliki pandangan bahwa kemungkinan penyebabnya yaitu karena reaksi merugikan terhadap trauma lokal seperti cedera kecil atau gigitan serangga pada area dimana lesi terbentuk.",
  // mel
  "Melanoma adalah jenis kanker kulit yang tergolong berbahaya karena kemampuannya yang dapat menyebar dengan cepat ke organ tubuh lain. Kanker kulit ini terjadi akibat pertumbuhan sel melanosit secara tidak normal. Faktor umum yang dicurigai sebagai penyebab melanoma adalah paparan sinar UV secara langsung. Kanker melanoma dapat muncul bahkan pada bagian kulit yang tidak terpancar sinar matahari. Kasus kanker ini termasuk jarang terjadi, namun penyakit langka ini tetap harus diwaspadai.",
  // nv
  "Melanocytic Nevi adalah neoplasma melanositik jinak yang biasanya muncul sebagai lesi datar atau terangkat. Nevus melanositik atau biasa disebut dengan tahi lalat, memiliki pigmen coklat hingga hitam.",
  // vasc
  "Vascular Lesions adalah kelainan yang tergolong umum karena muncul saat lahir atau segera setelah lahir. Kelainan ini biasa juga disebut dengan tanda lahir. Lesi vaskuler terbagi menjadi tiga jenis, yaitu cherry angioma, angiokeratoma, dan granuloma piogenik. Ketiganya merupakan contoh angioma jinak dan ganas.",
];

async function loadModel() {
  console.log("model loading..");
  loader = document.getElementById("progress-box");
  load_button = document.getElementById("load-button");
  loader.style.display = "block";
  modelName = "mobilenet";
  model = undefined;
  model = await tf.loadLayersModel(
    "./sc_detector/artifacts/tfjs/mobilen_model/model.json"
  );
  loader.style.display = "none";
  load_button.disabled = true;
  alert("Model loaded");
  console.log("model loaded..");
}

async function loadFile() {
  console.log("image is in loadfile..");
  document.getElementById("select-file-box").style.display = "table-cell";
  document.getElementById("predict-box").style.display = "table-cell";
  document.getElementById("prediction").innerHTML =
    "Tekan Prediksi untuk mengetahui jenis kanker kulit!!";
  var fileInputElement = document.getElementById("select-file-image");
  console.log(fileInputElement.files[0]);
  renderImage(fileInputElement.files[0]);
}

function renderImage(file) {
  var reader = new FileReader();
  console.log("image is here..");
  reader.onload = function (event) {
    img_url = event.target.result;
    console.log("image is here2..");
    document.getElementById("test-image").src = img_url;
  };
  reader.readAsDataURL(file);
}

var chart = "";
var firstTime = 0;
function loadChart(label, data) {
  var ctx = document.getElementById("chart-box").getContext("2d");
  chart = new Chart(ctx, {
    //type of chart
    type: "bar",

    //data for Chart
    data: {
      labels: label,
      datasets: [
        {
          label: "Grafik Probabilitas",
          backgroundColor: "rgb(82, 196, 211)",
          borderColor: "rgb(82, 196, 211)",
          color: "white",
          tickColor: "white",
          data: data,
        },
      ],
    },
    //config options
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white",
            font: {
              size: 18,
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            color: "white",
            font: {
              size: 15,
            },
          },
        },
        x: {
          ticks: {
            color: "white",
            font: {
              size: 15,
            },
          },
        },
      },
    },
  });
}

async function predButton() {
  console.log("model loading..");

  if (model == undefined) {
    alert("Mohon upload model terlebih dahulu..");
  }
  if (document.getElementById("predict-box").style.display == "none") {
    alert("Mohon upload gambar..");
  }
  console.log(model);
  let image = document.getElementById("test-image");
  let tensor = preprocessImage(image, modelName);

  let predictions = await model.predict(tensor).data();
  let results_all = Array.from(predictions)
    .map(function (p, i) {
      return {
        probability: p,
        className: TARGET_CLASSES[i],
        index: i,
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    });

  let results = results_all.slice(0, 3);

  document.getElementById("predict-box").style.display = "block";
  const predClass = results[0].className;
  document.getElementById("prediction").innerHTML =
    "Hasil prediksi jenis kanker kulit: <br><b>" +
    predClass +
    "</b><br>" + CLASS_EXPLANATIONS[results[0].index] +
    "<br><br>" + CLASS_DETAILS[results[0].index];

  var ul = document.getElementById("predict-list");
  ul.innerHTML = "";
  results.forEach(function (p) {
    console.log(
      p.className + "(" + p.index + ")" + " " + p.probability.toFixed(6)
    );
    var li = document.createElement("LI");
    li.innerHTML =
      p.className + "(" + p.index + ")" + " " + p.probability.toFixed(6);
    ul.appendChild(li);
  });

  // label = ["0", "1", "2", "3", "4", "5", "6"];
  label = [
    "0: akiec",
    "1: bcc",
    "2: bkl",
    "3: df",
    "4: mel",
    "5: nv",
    "6: vasc",
  ];
  if (firstTime == 0) {
    loadChart(label, predictions);
    firstTime = 1;
  } else {
    chart.destroy();
    loadChart(label, predictions);
  }

  document.getElementById("chart-box").style.display = "block";
}

function preprocessImage(image, modelName) {
  let tensor = tf.browser
    .fromPixels(image)
    .resizeNearestNeighbor([224, 224])
    .toFloat();

  if (modelName === undefined) {
    return tensor.expandDims();
  } else if (modelName === "mobilenet") {
    let offset = tf.scalar(127.5);
    return tensor.sub(offset).div(offset).expandDims();
  } else {
    alert("Model tidak diketahui..");
  }
}

function loadDemoImage() {
  document.getElementById("predict-box").style.display = "table-cell";
  document.getElementById("prediction").innerHTML =
    "Tekan Prediksi untuk mengetahui jenis kanker kulit";
  document.getElementById("select-file-box").style.display = "table-cell";
  document.getElementById("predict-list").innerHTML = "";

  base_path = "./assets/nv_samplepic.jpg";
  // maximum = 4;
  // minimum = 1;
  // var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  // img_path = base_path + randomnumber + ".jpeg"
  img_path = base_path;
  document.getElementById("test-image").src = img_path;
}
