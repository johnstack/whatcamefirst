(function () {
	'use strict';

	window.objects = _.shuffle(window.objects)
	var startingObjects = _.sampleSize(window.objects, 7)

	console.log(startingObjects)

	var timelineObjects = []
	var dockObjects = []

	var lives = 3
	var streak = 0
	var longestStreak = 0
	var score = 0

	var getTitle = function (title) {

		title = title.split(',')[0].split('(')[0]
		title = title.replace(/(for|in|of)? \d{4}-\d{2,4}/, '')
		title = title.replace(/ (for|in|of) \d{4}/, '')

		return title.trim()
	}

	var getCard = function (el) {
		return "<li data-id='"+el.id+"' data-date='"+el.date+"'><img src='http://smgco-images.s3.amazonaws.com/media/"+el.thumb+"'><div class='caption'>"+getTitle(el.title)+"</div><div class='date'>"+el.date+"</div></li>"
	}

	// Swap first two if not in correct order
	if (startingObjects[0].date > startingObjects[1].date) {
		var clone = _.cloneDeep(startingObjects[0])
		startingObjects[0] = startingObjects[1]
		startingObjects[1] = clone
	}

	for (var i = 0; i < 2; i++) {
		timelineObjects.push(getCard(startingObjects[i]))
	}

	for (var i = 2; i < startingObjects.length; i++) {
		dockObjects.push(getCard(startingObjects[i]))
	}

	$("#timeline").append(timelineObjects.join(''))
	$("#dock").append(dockObjects.join(''))

	var byId = function (id) { return document.getElementById(id); }

	var timeline = Sortable.create(byId('timeline'), {
		group: {
			name: "timeline",
			pull: false,
			put: "dock",
		},
		sort: false,
		animation: 300,
		disabled: true,
		forceFallback: true,
		onAdd: function (ev) {
			var dates = _.compact($("#timeline").children('li').map(function(el){ return parseInt($(this).data('date'), 10)}))
			var i = 1
			while (i < dates.length && (!dates[i] || dates[i] >= dates[i-1])) {
				i++
			}

			if (i === dates.length) {
				var tick = $("<div class='correct'></div>").appendTo($(ev.item))
				tick.velocity('fadeOut', { delay: 500 })

				streak++
				score++
				
				if (streak%3 === 0 && lives < 3) {
					lives++
					$($("#life-counter").children()[3 - lives]).removeClass('lost')
				}
			}
			else {
				$(ev.item).data('date', '0').append("<div class='incorrect'></div>").velocity({ opacity: [0, 1], scale: [0, 1] }, { delay: 1000, display: 'none' })
				$($("#life-counter").children()[3 - lives]).addClass('lost')

				lives--

				if (lives === 0) {
					$("#score-game-over").text(score)
					$("#game-over").addClass('show')
				}

				if (streak > longestStreak) {
					longestStreak = streak
				}
				streak = 0
			}

			var newCard = $(getCard(_.sample(window.objects))).css('transform', 'scale(0)').appendTo($("#dock"))

			newCard.velocity({ scale: [1, 0] }, 500)
		}
	});

	Sortable.create(byId('dock'), {
		group: {
			name: "dock",
			pull: true,
			put: false
		},
		sort: false,
		animation: 300,
		forceFallback: true,
		fallbackOnBody: true,
		onStart:function (evt) {
			timeline.option("disabled", false)
		},
		onEnd: function (evt) { 
			timeline.option("disabled", true)
		}
	});

	$("#start-over").on('click', function (ev) {
		location.reload();
	})

	setTimeout(function () {
		$("#intro-img").addClass('docked')
	}, 1500)

	setTimeout(function () {
		$("#start-screen").addClass('show-content')
	}, 2000)

	setTimeout(function () {
		$("#start-screen").addClass('hide')
	}, 4000)

	// var introStep = 0

	// var dockLogo = function () {
	// 	$("#intro-img").addClass('docked')

	// 	setTimeout(function () {
	// 		$("#start-screen").addClass('show-content')
	// 	}, 500)

	// 	introStep++
	// }

	// $("#intro-img").one('click', function (ev) {
	// 	dockLogo()
	// })

	// $("#start-screen").on('click', function (ev) {
	// 	if (introStep === 1) {
	// 		$("#start-screen").addClass('hide')
	// 		introStep++
	// 	}
	// 	else if (introStep === 0) {
	// 		dockLogo()
	// 	}
	// })


})();
