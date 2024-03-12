window.allLessonData = "";
window.allSessionData = "";
window.filteredLessonData = "";
window.filters = new Set();
window.currentPage = 1;
window.itemsPerPage = 10;
window.review = "";
window.chat = "";

/*
$(document).ready(function() {
  //onload 获取整个数据
  //数据替换成data.json
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/getData",
    data: '123',
    success: function(msg) {
      msg = JSON.parse(msg);
      data = msg['data'];
      console.log(data);
      window.allLessonData = data;
      window.filteredLessonData = window.allLessonData;
      addSideFilterValues();
      filterByOptions();
      $('#num_results')[0].innerText = 'Result (' + window.filteredLessonData.length + ' lessons found)';
    },
    fail: function(jqXHR, textStatus, errorThrown) {
      console.log("fail");
    }
  });
});

*/

$(document).ready(function() {
  $.ajax({
    url: "/getAlldata",
    type: "POST",
    success: function(msg) {
      window.allLessonData = msg['lesson'];
      window.allSessionData = msg['lesson_session']
      window.review = msg['reviews'];
      window.chat = msg['chats'];
      console.log('lesson', window.allLessonData);
      console.log('lesson_session', window.allSessionData);
      console.log('reviews', window.review);
      console.log('chat', window.chat);
      window.filteredLessonData = window.allLessonData;
      addSideFilterValues();
      filterByOptions();
      bindSearchEnter();
      $('#num_results')[0].innerText = 'Result (' + window.filteredLessonData.length + ' lessons found)';
    }

  })
})

function bindSearchEnter() {
  searchBar = $('#searchInput')[0];
  searchBar.addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
      searchTextList = searchBar.value.split(',');
      for (let x of window.filters) {
        if (x.indexOf('name_') !== -1) {
          window.filters.delete(x);
        }
      }
      searchTextList.forEach(function(item) {
        window.filters.add('name_' + item.trim());
      })
      filterByOptions();
    }
  });

  $("#clearSearch").click(function() {
    searchBar.value = "";
    searchTextList = searchBar.value.split(',');
    for (let x of window.filters) {
      if (x.indexOf('name_') !== -1) {
        window.filters.delete(x);
      }
    }
    if (searchBar.value.trim()) {
      searchTextList.forEach(function(item) {
        window.filters.add('name_' + item.trim());
      })
    }
    filterByOptions();
  });
}


function createPagination() {
  numPage = Math.ceil(window.filteredLessonData.length / window.itemsPerPage);
  //console.log(numPage);
  $('#pagination').find("li").remove();
  if (window.currentPage != 1) {
    var li_str = '<li class="mostPrevious"><a aria-label="MostPrevious"><span aria-hidden="true">&laquo;</span></a></li>';
    $('#pagination').append(li_str);
    var li_str = '<li class="previous"><a aria-label="Previous"><span aria-hidden="true">&lt;</span></a></li>';
    $('#pagination').append(li_str);
  }
  for (let i = 1; i <= Math.min(numPage, 5); i++) {
    //console.log(i);
    var li_str = '<li class="pageNum';
    if (window.currentPage == i) {
      li_str += ' active';
    }
    li_str += '" data-page="' + i + '"><a>' + i + '</a></li>';
    $('#pagination').append(li_str);
  }
  if (window.currentPage != numPage) {
    var li_str = '<li class="next"><a aria-label="Next"><span aria-hidden="true">&gt;</span></a></li>';
    $('#pagination').append(li_str);
    var li_str = '<li class="mostNext"><a aria-label="mostNext"><span aria-hidden="true">&raquo;</span></a></li>';
    $('#pagination').append(li_str);
  }
  if (numPage > 5) {

  }

  $('li.mostPrevious').click(function() {
    window.currentPage = 1;
    loadDatatoList(window.filteredLessonData);
    createPagination();
  });

  $('li.previous').click(function() {
    window.currentPage = window.currentPage - 1;
    loadDatatoList(window.filteredLessonData);
    createPagination();
  });

  $('li.next').click(function() {
    window.currentPage = window.currentPage + 1;
    loadDatatoList(window.filteredLessonData);
    createPagination();
  });

  $('li.mostNext').click(function() {
    window.currentPage = numPage;
    loadDatatoList(window.filteredLessonData);
    createPagination();
  });

  $('li.pageNum').click(function() {
    //console.log("kkk");
    window.currentPage = parseInt($(this).attr('data-page'));
    loadDatatoList(window.filteredLessonData);
    createPagination();
  });
}

function generateStars(rate, li_str) {
  var full_star = parseInt(rate);
  var half_star = rate % 1;
  for (let j = 1; j < full_star + 1; j++) {
    li_str += '<div data-value="star' + j + '" class="star stared"></div>';
  }
  if (half_star >= 0.5) {
    li_str += '<div data-value="star' + (full_star + 1) + '" class="star stared-half"></div>';
  } else {
    li_str += '<div data-value="star' + (full_star + 1) + '" class="star"></div>';
  }
  for (let j = full_star; j < 4; j++) {
    li_str += '<div data-value="star' + (j + 2) + '" class="star"></div>';
  }
  return li_str
}



//获取review
//数据替换成review.json
function requestReviews(lesson_id) {
  data = window.review;
  //console.log(data);
  var li_str = '';
  for (let i = 0; i < data.length; i++) {
    if (lesson_id == data[i]['lesson_id']) {
      li_str += '<li><div class="review-popover">' + data[i]['review'] + '</div></li>';
    }
  }
  if (li_str == '') {
    li_str += '<li><div class="review-popover">' + 'There is no review yet' + '</div></li>';
  }

  li_str += '<button type="button" class="btn btn-primary" onclick="openReviewDialog()"> Write your review </button>'
  $('.popover-content')[0].innerHTML = li_str;
}

function openReviewDialog() {
  var reviewDialog = document.getElementById('reviewDialog');
  reviewDialog.style.display = 'block';
  $("[data-toggle='popover']").each(function(i, v) {
    $(v).popover('hide');
  });
}

function changeReviewStars(starValue) {
  var starNum = parseInt(starValue);
  for (let i = 1; i <= starNum; i++) {
    document.getElementById(i + 'reviewStar').className = "star stared";
    document.getElementById(i + 'reviewStar').style.backgroundImage = "url('./static/imgs/star-fill.png')";
  }
  for (let i = starNum + 1; i <= 5; i++) {
    document.getElementById(i + 'reviewStar').className = "star";
    document.getElementById(i + 'reviewStar').style.backgroundImage = "url('./static/imgs/star.png')";
  }
}

function closeReviewDialog() {
  var reviewDialog = document.getElementById('reviewDialog');
  reviewDialog.style.display = 'none';
}

function submitReviewAlert() {
  alert("Not implemented yet");
  var reviewDialog = document.getElementById('reviewDialog');
  reviewDialog.style.display = 'none';
}

function submitChatAlert() {
  alert("Not implemented yet");
  var chatDialog = document.getElementById('chatDialog');
  chatDialog.style.display = 'none';
}

function closeChatDialog() {
  var chatDialog = document.getElementById('chatDialog');
  chatDialog.style.display = 'none';
}

function openChatDialog() {
  var chatDialog = document.getElementById('chatDialog');
  chatDialog.style.display = 'block';
  $("#commentItems").empty();
  for (let i = 0; i < window.chat.length; i++) {
    var item = '';
    item += '<div id="comment' + window.chat[i]['thread_id'] + '" class="comment">';
    item += '	<div class="content ">';
    item += '		<a class="author"> ' + window.chat[i]['userName'] + ' </a>';

    item += '		<div class="text"> ' + window.chat[i]['content'] + ' </div>';
    item += '		<div class="metadata fl">';
    item += '			<span class="date"> ' + window.chat[i]['time'] + ' </span>';
    item += '		</div>';
    item += '		<div class="actions fl">';
    item += '			<a class="reply" selfid="' + window.chat[i]['id'] + '" selfname="' + window.chat[i]['userName'] + '" >Reply</a>';
    item += '		</div>';
    item += '		<div class="clear"></div>';
    item += '	</div>';
    item += '</div>';
    if (window.chat[i]['sortID'] == 0) {
      $("#commentItems").append(item);
    } else {
      var comments = '';
      comments += '<div id="comments' + window.chat[i]['sortID'] + '" class="comments">';
      comments += item;
      comments += '</div>';
      //console.log(comments);
      $("#comment" + window.chat[i]['thread_id']).append(comments);
    }
  }

  bindReplyClick();
  //addCommentForm(0, null);
}

function bindReplyClick() {
  $(".reply").bind('click', function() {
    addCommentForm(1, this);
  })
}

function addCommentForm(comment, obj) {
  if ($("#replyBox")[0]) {
    // 删除评论回复框
    $("#replyBox").remove();
  }
  var boxHtml = '';
  boxHtml += '<form id="replyBox" class="ui form">';
  boxHtml += '	<div class="ui  form">';
  //boxHtml += '		<div class="two fields">'
  boxHtml += '			<div class="field" >';
  boxHtml += '				<input type="text" id="userName" placeholder="Your name"/>';
  //boxHtml += '				<label class="userNameLabel" for="userName">Your Name</label>';
  boxHtml += '			</div>';
  if (comment) {
    reply_id = obj.getAttribute('selfid');
    boxHtml += '			<div class="field" >';
    boxHtml += '				<input type="text" id="userName" />';
    boxHtml += '				<label class="userNameLabel" for="userName">Replying: ' + $("a[selfid=" + reply_id + "]")[0].getAttribute('selfname') + '</label>';
    boxHtml += '			</div>';
    boxHtml += '		<div class="contentField field" >';
    boxHtml += '			<textarea id="commentContent" placeholder="Content..."></textarea>';
    //boxHtml += '			<label class="commentContentLabel" for="commentContent">Content</label>';
    boxHtml += '		</div>';
    boxHtml += '		<div id="publicComment" class="ui button teal submit labeled icon">';
    boxHtml += '			 Submit';
    boxHtml += '		</div>';
    boxHtml += '		<button class="btn">';
    boxHtml += '			 Close';
    boxHtml += '		</button>';
    boxHtml += '	</div>';
    boxHtml += '</form>';
    $("a[selfid=" + reply_id + "]").parent().append(boxHtml);
  } else {
    boxHtml += '		<div class="contentField field" >';
    boxHtml += '			<textarea id="commentContent"></textarea>';
    boxHtml += '			<label class="commentContentLabel" for="commentContent">Content</label>';
    boxHtml += '		</div>';
    boxHtml += '		<div id="publicComment" class="ui button teal submit labeled icon">';
    boxHtml += '			 Submit';
    boxHtml += '		</div>';
    boxHtml += '		<button class="btn">';
    boxHtml += '			 Close';
    boxHtml += '		</button>';
    boxHtml += '	</div>';
    boxHtml += '</form>';
    $("#commentItems").parent().append(boxHtml);
  }
}

function changeItemsPerPage(numItems) {
  window.itemsPerPage = numItems;
  loadDatatoList(window.filteredLessonData);
  createPagination();

}

function expandLessonSessions(lesson_id) {
  if ($('#result_session_ul_' + lesson_id).find("li").length == 0) {
    for (let i = 0; i < window.allSessionData.length; i++) {
      //console.log(i);
      if (window.allSessionData[i]['lesson_id'] == lesson_id) {
        //console.log(window.allSessionData[i]);
        var li_str = '<li class="titleInfo"><div class="titleInfo1 col-md-6"><a href="';
        li_str += window.allSessionData[i]['url'] + '" target="_blank">';
        li_str += window.allSessionData[i]['name'];
        li_str += '</a></div><div class="titleInfo2 col-md-6">';

        var attriList = ['grade', 'subject', 'length', 'concept'];
        for (let j = 0; j < attriList.length; j++) {
          if (window.allSessionData[i][attriList[j]]) {
            li_str += window.allSessionData[i][attriList[j]] + ' | ';
          }
        }


        //li_str += window.allSessionData[i]['grade'] + ' | ' + window.allSessionData[i]['subject'];
        li_str += '</div><div class="clear"></div></li>';
        //console.log(li_str);
        $('#result_session_ul_' + lesson_id).append(li_str);
      }
    }
  }

  var contentDiv = document.getElementById('sessionDiv_' + lesson_id);
  var triangle = document.getElementById('triangle_' + lesson_id);

  if (contentDiv.classList.contains('hidden')) {
    // 如果内容隐藏，则显示内容
    contentDiv.classList.remove('hidden');
    triangle.classList.add('glyphicon-triangle-top');
  } else {
    // 如果内容显示，则隐藏内容
    contentDiv.classList.add('hidden');
    triangle.classList.remove('glyphicon-triangle-top');
  }
}

function loadDatatoList(data) {
  $('#result_lesson_ul').find("li").remove();
  for (let i = (window.currentPage - 1) * window.itemsPerPage; i < Math.min(data.length, window.currentPage * window.itemsPerPage); i++) {
    //console.log(data[i]['name']);
    var star_num = data[i]['star_1'] + data[i]['star_2'] + data[i]['star_3'] + data[i]['star_4'] + data[i]['star_5']
    var rate = (data[i]['star_1'] + data[i]['star_2'] * 2 + data[i]['star_3'] * 3 + data[i]['star_4'] * 4 + data[i]['star_5'] * 5) / star_num;
    if (star_num == 0) {
      rate = 0;
    }
    full_star = parseInt(rate);
    half_star = rate % 1;
    var li_str = '<li>';
    li_str += '<div class="top-line">';
    li_str += '<div class="title"><a onclick="expandLessonSessions(' + data[i]['id'] + ')">';
    li_str += data[i]['name'] + '</a> &nbsp<span id="triangle_' + data[i]['id'];
    li_str += '" class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span></div>';
    li_str += '</div><div class="Info hidden" id="sessionDiv_' + data[i]['id'] + '"><ul id="result_session_ul_' + data[i]['id'] + '"></ul></div><div class="mid-line">';
    li_str += '<div id="rateBtn_' + data[i]['id'] + '" rate="' + rate + '" class="mid-line" data-toggle="popover" data-placement="bottom" data-html="true" data-placement="bottom">';
    li_str = generateStars(rate, li_str);
    li_str += '<div class="star_num">▾ ' + star_num + ' ratings</div>';
    li_str += '</div>';

    li_str += '<div><button class="btn" onclick="openChatDialog()">Chat</button></div>';
    li_str += '</div><div class="bottom-line">';

    var attriList = ['creator', 'grade', 'subject', 'environment', 'length', 'concept', 'device'];
    for (let j = 0; j < attriList.length; j++) {
      if (data[i][attriList[j]]) {
        if (j == 1) {
          li_str += 'Grades: '
          li_str += data[i][attriList[j]] + ' | ';
        } else if (j == 2) {
          li_str += 'Subjects: '
          li_str += data[i][attriList[j]] + ' | ';
        } else if (j == 3) {
          li_str += 'Environments: '
          li_str += data[i][attriList[j]] + ' | ';
        } else if (j == 5) {
          li_str += 'Concepts: '
          li_str += data[i][attriList[j]] + ' | ';
        } else if (j == 6) {
          li_str += 'Devices: '
          li_str += data[i][attriList[j]] + ' | ';
        } else {
          li_str += data[i][attriList[j]] + ' | ';
        }
      }
    }
    //li_str += data[i]['creator'] + ' | ' + data[i]['grade'] + ' | ' + data[i]['subject'] + ' | ' + data[i]['environment'] ;
    li_str += '</div></li>';
    $('#result_lesson_ul').append(li_str);
  }

  $("[data-toggle='popover']").each(function() {
    var element = $(this);
    var lesson_id = element.attr('id').replace(/[^\d]/g, "");
    var rate = element.attr('rate');
    //console.log(rate);
    element.popover({
      title: '<div class="popover-title">' + generateStars(rate, '') + '&nbsp&nbsp&nbsp' + (+(rate)).toFixed(1) + ' out of 5</div>',
    });

    element.on('shown.bs.popover', function() {
      requestReviews(lesson_id);
      $("[data-toggle='popover']").each(function(i, v) {
        if (v.id !== element.attr('id')) {
          $(v).popover('hide');
        }
      });
    });

    element.on('hidden.bs.popover', function(e) {
      $(e.target).data("bs.popover").inState.click = false;
    });
  });
}

function addSideFilterValues() {
  $('#filters').on('click', 'input[type=checkbox]', function() {
    if (window.filters.has(this.id)) {
      window.filters.delete(this.id);
    } else {
      window.filters.add(this.id);
    }
    filterByOptions();
  });
}

function filterByOptions() {
  console.log('filters', window.filters);
  window.filteredLessonData = [];
  if (!window.filters.size) {
    window.filteredLessonData = window.allLessonData;
  }

  var formatFilter = {
    "name": [],
    "subject": [],
    "grade": [],
    "concept": [],
    "device": [],
    "environment": [],
    "standards": [],
  }

  window.filters.forEach(function(filter) {
    m = filter.indexOf('_');
    key = filter.slice(0, m);
    value = filter.slice(m + 1);

    formatFilter[key].push(value);
    console.log('formatFilter', formatFilter);
  });

  tempData = window.allLessonData;
  for (let key in formatFilter) {
    console.log('key', key);
    /*
    if (tempData == window.allLessonData) {
      //tempData = window.filteredLessonData;
      console.log('tempData', 'window.allLessonData')
    } else {
      tempData = window.filteredLessonData;
      console.log('tempData', 'window.filteredLessonData')
    }*/
    window.filteredLessonData = [];
    if (!window.filters.size) {
      window.filteredLessonData = window.allLessonData;
    }

    values = formatFilter[key];
    if (values.length) {
      console.log("values", values);
      values.forEach(function(value) {
        console.log("value", value);
        for (let j = 0; j < tempData.length; j++) {
          console.log('j', j);
          if (tempData[j][key].toLowerCase().indexOf(value.toLowerCase()) > -1) {
            if (!window.filteredLessonData.includes(tempData[j])) {
              window.filteredLessonData.push(tempData[j]);
              //console.log(tempData[j]);
            }
          }
        }
      })
    } else {
      console.log("emptyValues");
      window.filteredLessonData = tempData;
    }
    console.log(window.filteredLessonData);
    tempData = window.filteredLessonData;
  }

  /*
    window.filters.forEach(function(filter) {
      m = filter.indexOf('_');
      key = filter.slice(0, m);
      value = filter.slice(m + 1);
      for (let j = 0; j < window.allLessonData.length; j++) {
        if (window.allLessonData[j][key]) {
          //console.log(window.allLessonData[j][key]);
          if (window.allLessonData[j][key].toLowerCase().indexOf(value.toLowerCase()) > -1) {
            if (!window.filteredLessonData.includes(window.allLessonData[j])) {
              window.filteredLessonData.push(window.allLessonData[j]);
              //console.log(window.allLessonData[j]);
            }
          }
        }
      }
    });*/
  loadDatatoList(window.filteredLessonData);
  createPagination();
}

function unCheckFilters() {
  window.filters = new Set();
  $("input[type='checkbox']").prop('checked', false);
  filterByOptions();
}
