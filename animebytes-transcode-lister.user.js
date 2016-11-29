// ==UserScript==
// @name        AnimeBytes MP3 Transcodes lister
// @namespace   animebytes.mp3.transcodes.lister
// @description Shows all transcodes for torrents on the FLAC conversion page
// @include     "https://animebytes.tv/better.php?page=*&action=transcode&order_by=*&order_way=*"
// @version     3
// @grant       none
// ==/UserScript==

/*
-alert_amount_transcodes- is the setting that decides when or if the script should play a notification sound
  ->
    {enabled} is the on/off switch for sound notifications
        It can be either true or false

    {amount} is the threshold for when the script should notify you. 
        It can be either [0], [1] or [2].
        Super duper cool feature: You can have it notify on several numbers like this: [0, 1]
        That will notify you of all torrents with either 0 or 1 transcodes.
        Note: When selecting 2 then you will get a notification for all torrents that have 2 or more transcodes.

    {volume} is the volume of the sound notification
        It can be a number between 0 and 1
        Examples:
            0
            1
            0.5
            0.3
            0.7

    {sound} is the sound that plays.
        List of sounds:
          tuturu
        Note: Only edit the text inside the quotes! 
              "tuturu" is the default so if you wanted to change it to something else,
              you would change it to "spooky" (get_sound("spooky"))


-alert_when_finished- is the setting group that controls whether or not a notification should play/show when all
torrents on the page have been searched through
  ->
    {enabled} self explanatory

    {volume} read above {volume} description

    {sound} read above {sound} description


-auto_opener- is the settings group that controls whether or not torrents that have X amount of transcodes should
automatically open a new tab
  ->
    {enabled} self explanatory

    [triggers] is the amount of transcodes that should trigger the auto opener
    Try settings {triggers} to [0, 1] and watch it open new tabs for each torrent that has either 1 or 0 transcodes
    Note: This works exactly the same way as the {amount} for the -alert_amount_transcodes- settings group.

*/


// Default settings
var settings = {
  "alert_amount_transcodes": {
    "enabled": false,
    "amount": [0],
    "seeder_threshold": 0,
    "volume": 0.5,
    "sound": get_sound("tuturu"),
    "sound_raw": "tuturu"
  },
  "alert_when_finished": {
    "enabled": false,
    "volume": 0.5,
    "sound": get_sound("ohmygah"),
    "sound_raw": "ohmygah"
  },
  "auto_opener": {
    "enabled": false,
    "triggers": [0],
    "seeder_threshold": 0
  },
  "auto_download": {
    "enabled": false,
    "triggers": [0],
    "seeder_threshold": 0
  },
  "desktop_notifications": {
    "alert_amount_transcodes": {
      "enabled": true,
      "triggers": [0],
      "seeder_threshold": 0
    },
    "alert_when_finished": {
     "enabled": true,
     "seeder_threshold": 0
    }
  },
  "version": 3
}

var def_settings = {
  "alert_amount_transcodes": {
    "enabled": false,
    "amount": [0],
    "seeder_threshold": 0,
    "volume": 0.5,
    "sound": get_sound("tuturu"),
    "sound_raw": "tuturu"
  },
  "alert_when_finished": {
    "enabled": false,
    "volume": 0.5,
    "sound": get_sound("ohmygah"),
    "sound_raw": "ohmygah"
  },
  "auto_opener": {
    "enabled": false,
    "triggers": [0],
    "seeder_threshold": 0
  },
  "auto_download": {
    "enabled": false,
    "triggers": [0],
    "seeder_threshold": 0
  },
  "desktop_notifications": {
    "alert_amount_transcodes": {
      "enabled": true,
      "triggers": [0],
      "seeder_threshold": 0
    },
    "alert_when_finished": {
     "enabled": true,
     "seeder_threshold": 0
    }
  },
  "version": 3
}


// My personal settings
/*
var settings = {
  "alert_amount_transcodes": {
    "enabled": true,
    "amount": [0],
    "volume": 0.4,
    "sound": get_sound("tuturu"),
    "sound_raw": "tuturu"
  },
  "alert_when_finished": {
    "enabled": true,
    "volume": 0.4,
    "sound": get_sound("ohmygah"),
    "sound_raw": "ohmygah"
  },
  "auto_opener": {
    "enabled": false,
    "triggers": [0]
  },
  "desktop_notifications": {
    "alert_amount_transcodes": {
      "enabled": true,
      "triggers": [0]
    },
    "alert_when_finished": {
     "enabled": true
    }
  }
}
*/


var media = {
  "icons": {
    "notification_image": "data:image/png;base64,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"
  }
}

Notification.requestPermission();

load_settings();
create_settings_menu();
initialize_settings();

var save_settings_button = document.getElementById("save_settings");

save_settings_button.addEventListener("click", function() {
  save_settings();
  window.location.reload();
}, true);

//var clickable = document.getElementById("content").getElementsByTagName("h2")[0];
var clickable = document.getElementById("scrape_button");

var sound = settings["alert_amount_transcodes"]["sound"];

var audioplayer = document.createElement('AUDIO');
audioplayer.style.display = 'none';
audioplayer.src = sound;
audioplayer.volume = settings["alert_amount_transcodes"]["volume"];
document.body.appendChild(audioplayer);

audioplayer.load();



var xhr = function(u, c, carryover, carryover2, seeds, download_link, t) {
	var r = new XMLHttpRequest();
	r.onreadystatechange = function() {
		if (r.readyState == 4 && r.status == 200) {
      console.log(seeds);
			c(r.response, carryover, carryover2, seeds, download_link, u);
		}
	};
	r.open("GET", u, true);
	if (t) {r.responseType = t;}
	r.overrideMimeType('text/plain');
  r.setRequestHeader("X-Requested-With", "Tomoko's Transcode Lister - V1 - http://tomoko.moe/abscripts/animebytes-transcode-lister.user.js")
	r.send();
	return r;
}

function scrape() {
  var torrent_links = document.getElementsByClassName("torrent");

  var i = 0;

  function scrape_recurse() {
    setTimeout(function() {
      var torrent_group_links = torrent_links[i].getElementsByTagName("a");

      for (var j = 0; j < torrent_group_links.length; j++) {
        if (torrent_group_links[j].title === "View Torrent") {
          var torrent_group_link = torrent_group_links[j];
        }
      }

      var seeds = get_amount_of_seeds(torrent_links[i]);
      var download_link = get_download_link(torrent_links[i]);


      xhr(torrent_group_link.href, some_callback, i, torrent_links.length, seeds, download_link);

      // This is for regular usage
      if (i < torrent_links.length) {
        scrape_recurse();
      }


      // This is for debugging purposes
      /*
      if (i < 6) {
        scrape_recurse();
      }
      */

      i++;
    }, 1000);
  }

  scrape_recurse();
}

function get_amount_of_seeds(torrent_group) {
  var td = torrent_group.getElementsByTagName("td");

  var td_noclass = [];

  for (var i = 0; i < td.length; i++) {
    if (td[i].hasAttribute("class") === false) {
      td_noclass.push(td[i]);
    }
  }

  return parseInt(td_noclass[2].textContent);
}


function get_download_link(torrent_group) {
  var dl_link = torrent_group.getElementsByClassName("download_link")[0].getElementsByTagName("a")[0].href;

  return dl_link;
}


function some_callback(res, index, torrent_amount, seeds, download_link, url) {

  var body = document.createElement("HTML");
  body.innerHTML = res;

  var group_torrent = body.getElementsByClassName("group_torrent");
  var torrent_links = document.getElementsByClassName("torrent");
  var torrent = torrent_links[index].getElementsByTagName("td")[1];

  var mp3_counter = 0;

  for (var i = 0; i < group_torrent.length; i++) {
    var format = group_torrent[i].getElementsByTagName("td")[0].getElementsByTagName("a")[2].textContent;

    if (/MP3/.test(format)) {
      var format_element = document.createElement("SPAN");
      var format_text_node = document.createTextNode(format);
      var br = document.createElement("BR");

      format_element.style.fontWeight = "bold";
      format_element.appendChild(format_text_node)

      torrent.appendChild(br);
      torrent.appendChild(format_element);

      mp3_counter++;
    }
  }

  var br = document.createElement("BR");
  var mp3_counter_element = document.createElement("span");
  var mp3_counter_node = document.createTextNode("Number of MP3 torrents: " + mp3_counter.toString());

  mp3_counter_element.appendChild(mp3_counter_node);

  /*
  #5fe75b is ZERO (0) transcodes | Green
  #f0d153 is ONE (1) transcode | Yellow
  #f74b4b is TWO (2) transcodes | Red
  */

  if (mp3_counter === 0) {
    mp3_counter_element.style.color = "#5fe75b";
  } else if (mp3_counter === 1) {
    mp3_counter_element.style.color = "#f0d153"
  } else if (mp3_counter === 2) {
    mp3_counter_element.style.color = "#f74b4b";
  } else {
    mp3_counter_element.style.color = "#f74b4b";
  }

  torrent.appendChild(br);
  torrent.appendChild(mp3_counter_element);

  notify_transcode_amount(mp3_counter, seeds);
  notify_finish(torrent_amount, index);
  auto_opener(mp3_counter, url, seeds);
  auto_downloader(mp3_counter, download_link, seeds);
}

function get_sound(id) {
  switch(id) {
    case "tuturu":
      return "data:audio/mpeg;base64,SUQzAwAAAAAHdlRFTkMAAAANAAAATGF2ZjUyLjE2LjAAVENPTgAAAAcAAABCbHVlcwBHRU9CAAAAGQAAAAAAU2ZNYXJrZXJzAAwAAABkAAAAAAAAAEdFT0IAAACIAAAAAABTZkNESW5mbwAcAAAAZAAAAAEAAACJxpLTBszHTL8bDsW+YvCTHAAAAGQAAACJxpLTBszHTL8bDsW+YvCTRAAAAEQAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kgAAAAAAAEuAAAAIAAAJcAAAAQAAAS4AAAAgAAAlwAAABP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+5IAvwAH6ABLgAAACAAACXAAAAEAAAEuAAAAIAAAJcAAAAT///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////uSAP+AC/AAS4AAAAgAAAlwAAABAAABLgAAACAAACXAAAAE///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7kgD/gAvwAEuAAAAIAAAJcAAAAQAAAS4AAAAgAAAlwAAABP////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9ZZ4IhIiTacaAIAQAUnAOPAgCAkLQIGMX1TBAA5EvO3jBzF9iQDQRBIEhy94BAERQdmZmfsn6EJC0zPzsS1G3ntXr154512HMJBMj07EsG5bo3GVDQewJgTEc/hCcBhMEAAQDigewJq148BQhvCAIgkHi9eZvVJaMkEw/tSkzCf+z/+5IA/4AL8ABLgAAACAAACXAAAAEAAAEuAAAAIAAAJcAAAARS9/osWCdrLPBEJESbTjQBUEgQTcOzYRBIPElDhzm7scOAHES87eMHMX2JANBEEgSFF7wCAIiheZmZ+yfoQkLTNediWo35nV69eeOddhzCoTI9OxLBuW6NvlQ0K4EwJiOr0JwGEwQAAAGKB7A+rXjwFCGqEARBIPF5+vtUzRlQwP7UpMwr/p23+iw856y4TWaWiUYwZMikJhNSpTDatzrR9QFlb3xJZTC4MaYsKqZ/2RvOOLDmImdT8RcAuWW/xmnetzT60Z2spxT2WONexatKWCNU511/f+9bz/9eZopjmhC55PGUJzHf6y///PwgxEowBgcYWGDyu1jhTXZbc//33/DvD0eNJY3BBEaedos3jKX9uWvxiTva13v9z1geqowscQxqsmOMdiQDHArp4q3aXH/////1//z+f/+aKKMSuGD1r0x/q7v8YuI1mlomGMGTorCYVUqU2GuZ1mSrFZpBkSWUzN4HUWiqZ/25veOLDmJGdT74soLllv8Zp3qe//uSAP+ABDtDTX0lgAKGiHmvpjAAV3k1P/msgAL2pmf/NZAAghmRneypKey/HOzbplcCNU51V/c7vW+/z9maKY5oQueDxlCYY/zWX//5+DjESjAGBxBVYPK7WOFNuW3P/99/w7w9HDSYNwIUNPO0Wfqyl/a1r8Yk72td7/c9cPVUYWOIY12TFGOxQBhgF08VbtLj/////4b/v/z//zRRRaVwwesN27Kv/c2wkgBBBUIAAAAAAAAAb5p8TSxSkfYx3ZfAIQ5/l6NaZeoO/ChzNYIREl7wx1ck1SR8v/twwMjKdkq99v51U0FvLSXqWzq5uR7wqRdhVul7uZs8z3Why1Xnd017tSm7hczu15iildDaqfTdjr514ez+rV1Eq1akp7trlJS6jsduZXtZ3qXHmGO8qv/R6z/////7/bT+FzvSFSAr5d81KVV1oIKhAAAAAAAAADfNPj6WKUj7GXLL4BCHP8yRrTL1B34UOZrBCIkveGOsMpqSPl/9uGBkZUUlXvt/PVNBby0l6ls6ubke8KkXYVbpe7mbOOe60OWq87umvf/7kgB6gATpRlnWYwAEnEjLOsxgAIrAsXXdlYAhUpYue7KwBNqU3cK2d2vMUUrobVT6bsdfOvD2fJmrqJVq1JT3bXKSl1HY7cyvazvUuPMMd5Vf+j1n/////3+2n8Lnek8z5dMpct9dcIYiQkJHPUwP9KZlyX1FNZTlrtxVOX/qvm8p3+zq/oOBUnGih4tBHJl9tP/uVOOPmhuQQkJ7r+/bx6x4yteam2rPQTlrmF5MeXDQ8KnSDWLV7jR60xKQZiAiQiUyqg70pmXZaSFP5Tlrulty/9V83lO/2dv2QFJOJhgeLQdky+2n/4VOOPmhuQQgCe6/v28eseMrXnm209ictcw+aWXDTxU6QawerfcaPZiUmSIBMSI65WCx8rB0RghI+IOM4bQHweG9bYjgxXPxGpb2hBzCkLDyHLDNDjGzTqUmQSQ/AmDQYlYpEt0v4ZfFuWexzf5nepB2nuMRxBD8c2FP5Nido2YIgAhESmVkLHq6QicDaI5Ft8NoJhGb1tiODGtfEalqeELEGglIkeG3oIZ7ysU9hURAQOF1wWI5Xfr/+5IAR4ACqitd8e9a2FOFa6496VsLWLV3zGGrYWKVrrmMNWzP68mbhsffu/aVOxOR0cCKtodwoLM0vk2eNeEMRMUE66mCs/clkmTwmRrncwzyj4dCi7z2yJXOJX/f5RXH8nZkL+28/2gcPeYmxocUPUvB/CSBuGyV0Kr3WtNr1MzrXQRMjJMyMUnNqTiYhip+jY9okciombeTMAMTEp5RCs/cFvt19TRF8/5n2JhnJD3D3wUueT/3+U7vmT+wl/bdvDFjI0a86XiUKlD1JYMYJ4CwKRkmtVS9a1u16matdBklLOGIdDjmJ4qHvZaLO1NNgLhTATExNdUgf19IddLGABSBIPms+1AP3Hf906HK06z+ph+KxG61V7Gz74PVXcJEG5xLD0NII4BxZzf8d8sj6qW22m6ucegrISGDPvf761vdQuodBExQjrmcIzJIdiURhoRTDwfNZ56Ak3Hf9zlCtWtZ+FMSxWKnWqvY2cP4PLM+nFcOJY7hpHWAcWVN/xu9n9Vc9U3TzibFWtcdYc56OP+ay7zsgu6kxExMTXlUJLCX//uSAFgAAoor3XMvWthUBbu+ZetbCnCxdcw9a2FWla65h61sKpIu4AXcHHv455VBYgJkTfrAN4S+d/EIuwf6Pmr/Bm8fUSytJpAmgBYboFA7VpfP7In9/9Q7h9NTWhJyJ+l05VYfCkllWP34fqnMRMTE15VChflyqlG7gXYHDt455VBYgJkTfrAN4S+d/EInwi6Pmrn1p453SxlJNIE0ALDcoKB2rPfNeyJ5p/VVDuH01NaDZxSHl04lWHx0llWP34PgekMAICEllRB/ow+9a3Bi5znCt54ekcBrntkHGNIg9jIwIqKYSJgkZmp9MvoIHq0yAbzJcfQIQL4maOmtFN1es+5hUzUFspAklKcxY3ZnSXdDp1onmVk9efdQt6QwAgISWVEH+jDp1qeClMznCt54cyuEI73/zC26MUz/lbCMtEkNTLOzfzN0EDXWQDepGPoEIHAmaH0zpqm6vWfPmFTNQRZSBJKU5ixuzO67odOtE8ysnrz7qFm4mDASISNqZgjLsv/HYDgKPi9bX1+sZBWjzTfQiWvufSEBAaBxbOjGhP/7kgBvgALUM9zzMGrYXAZ7nmcNWwrMvXfMNathXxevOYa9bBaq0ThSXdZmVB3KZxzdZ1E4gn1qffUdTZSCkTUppO1FJNigtsyGhGVl7qKUOys1JiJkRJX04Qy7LvwTAcVlYum19frGQSUeab6ET19z5kFaAIBxNnRrimcf1w5V+8w2od7nJtzzLBkpf/5xvPv/iW8TFJKxXO3162vqJlsySEZWu6ilDlSomHQRIRJG6mCTxGCrkFQ+mmfK0hrayYzFnmnpKMD+YEyOQF8AMpSfWqSDbdffad1X2g7YyaRZsXpnMX//OcW1XGsYvrxc/Fd137VzBmtu9vR9qJSz/1v4kmGQRIRJG6mCTxGCqkehpKs+VpDW1kx0Y809JRgfzAmRyAvgBlKT61NUG26++07qvtB2xk0ezYvTOYv/+c4tquNYxfXi5+K7rv2rmDNbd7ej7USln/rfxJoUQQShVSCHYJiUloHrMmQ0KFtzLFvVpOXGNm2PBivt/EhpD6CRO9Zrh6IgjGrTFhyy1DqHIVGyPSaza+OSVqPlkfpSSgbEqwX/+5IAfAACvjLdczJ62FemW65mT1sKnKVpjD0LYVSUrTGHoWxDouGiwVDVn8RB1WV1KIIJQspBIIBfaDaCDTFcPShbcyxhsJbXGNm2PBivt/EhpD6CRO9ZrJURDzVpiw5Zah1DkKjZHkOsjh3xckrUfLI/SklA0CqwVPLBUsDIas/iIOqyoFkiEjMyRtxxsAybGarOnSfAM5i6jc5cLR5kwzdYh782qTSQMVtJxiouI9PlzkUloV9xgb2q1RGrOwuxa2OOxTC98Z2eVrevtltmx09DmozM6wUVhgUiBj/SzP731VgiEjQyNtxtsByZ6GXU28K2hGd5eT3zVelWq3NAXnvlZKgHSsPUKAEDX25LJrOpP+RxH08SVi5mnwdsHs1mG7rss+87zWZ47JSVbFO1sdYKCgcCsgY/0sz+99V4EhMQMir7oEhEScPSQB3iENuYLfNB2kap0iRMiWqummDiEKPKt6BeKXomQjG/1IBgbrETsiazF9rcXaCvUQNEzodKPE0LHclLcqt2018rX/DV9f//Go/TckAkkRplB9NSt24Z//uSAI4AAugxWXnsWtpbBksvYSlbSv0NX8e1C6FWGStxh6FsdgrKCLSnd7cRDkXFpvdm9uhbx93uMo/XL5/0UdX9HCMbP04BgbvDvsnazF4+rjH4rm1UiIdDrFxKix1r1Y1QWAxJoldhzVqKvSCspNyNqSySAPJC8+5PUs8eNLPv51ozktkrfEJvUL3WfJEJUEaWqf/gYzf+s4JR2Y1Sql4TcxJRcw+b6qXlt2f53+v/VfN+7tWK3OVv16lp7053y6KVUtInSFESM0M25JIwB0RqB1GhaIIIhgwfa8dGm1yX0zN0qhi1z8RBZgWyqiZ1nZ6t/9MAZt2saQS2WdFiUW6P9LrCNS1LR7gr/7b8qpR/3tywolFlX9dctLPWJexwp7rWPUnJkt21v21oB4Rj+UXKJdl2cs1ZXoQIq8x5n5zOW9Yi121JJJQJrW/gQc1/z9A2EZ4F4NEUOwvj1uIjseTQ1DTKQXVSkgkj3ax3EUj0OEGqoaPkk3WiCLv65W6n3jb64GLyJF2SVy2WQBAvoVJRvBeDrLzC8QuBJhcljD/ETf/7kACaAALAO1drDzLaXodq3zHmW0wdCVmnvQupYBsqtPehbMV9PrMCh3MyWVNN/8k3iu6CY61mRUZYoiZOsOVct/suVjrnPEiTUj5XUior5tHy6i5FiTwuWpWy1sEyADEU5JK7bLGBCe9tYvpAIdCQZUddcksBmrUWNDX1DCZ5d4svK5PLt1v/EC1cz6pJdZm+DsRJbOW8zqfyPGXUZPWy9fTUy1CTMf9NAtbIzuN1d51Jr/KT/ef/1R0kygCm243I40AlMbkgF/HsC1RsjyAaa0MdW032JVtbhmbtzY8qgo3/19xvjXxNM6x7o2HnE7MvVt4xJIrW/8MaqHPOm2OX6/nZc/Gxl7HbS51I3oDv/eP3X6n1FglNyVySRsBKfW+kQiCiQEi89IRED/Z9vmB4ezJGvbGJIarUev/jTGR5g6YuhBjigmIudQs6Kac3MxIlTZiEdQ6IZKtlMPogrFpSoV0nR8TOtW6qLMrVW1KuJTxaXGCBpBu6ypHcQpT9VWodGlcyxc68ikRKGHHXf/8/tnKVH5+PtjqmHq8ie2bjdv/7kgCggALiPlRrDzLoWefKbT3mXQqY60+nvKthcJ2qZPeZbs/7U+2rX+lw//3a8fl2t7ynPNUPbTs/00CoQdTUJX/IOozTRtwaLALacrlsjYEHZZ5agwu+MDpeyqqfw7iEpb2iVdKzcH5ptdl4SWt/41e+N79MmtvRwRsI4j2zO0t5DXHjBGxvCOVKWpB7SIY7dOzCzu3R2y7lLblH5KW05G0+T8SpY1Vt9SCAviqsQhKAfWSJO5mQGk3LUWz5tV1HW/4UkdjSUL//vvb89km4mTzgsnMPsY+b08S288L/raLbc3CLII/vHyGzmFHWjzJ3HJ6W7uqnw9+fgyGwXHJG5JG+IO/V+UPjDoQiRYym2PYTiKq6yUvvLlW9M2gIB3F8zk9/+6Tovy/hkqKzsOyv/73WfJrL0wkUXNc/vQHfp/CNtMdnuU1rbo4X1tTJ1OU8n9MHpxpYOKUsgMLZTakslssfEI/ercDFziI+NukmQgQNh+eQEIqEhMoPBGExEg3zF/m8rjKDiShS7mhX/kcplKsw1w0kjYZcac5gpes2wfX/+5IArAAC5T5Taw9C6lXHGjk95ltMBONLrDDLYXgb6bWDoWw0MJo6obCwYEVhtaxc4msNop9KH48bIXEQMiTjtsltsfCaxXTEX8zwCpAQF01j2Ow4NfME6C2/typ0Co1Vf+3//ReP43hZuhu9BPf9vn7ZnX3Tq2Jy7gXeULqO0J2phO/puqqzpc+H3GIL23FHnPR61CpImoyBUhwFNx1ySRoBKbxZhPwTYEq59vjjMEkBwDydTDxJMuH+ooFweQc063v2WbU/04A9OL7HYvt/0WR96IgNghpOch29EcJNGVT7ktEK/KYqg+JZyrbNf5P/b/o7t9ZZKccultljAG8p6h8DCAhlVyfMdDETzlN7XdsMf/eqIqA16tr+l/5IMe9RHrKcbTiIssgtdP9jHi6exm4yDs+2wnlYQ0hZmUsRMPqY8pliz9ejEnxAi6I7vRb386VYXdfvt/tqBCN67aeDArLlnNVyqAYvxRysKw/rs6Z2PB+EO8P916TMNnHGzG8hgibHIZSGbHnn7dKXmzxXrF4K2gyPUauisl/lVOF0zmGL//uSALKAAu8702nrMthbCBpNPaZdS50PS6g9C6GKoeo1hiV0gzJYwST7y7ZyfX7NzdkP73w3ukANlOOSyWSRgJr+NBPhcgGzvbhthQ4brln4VsCC8//22Lpd7zv6jz/yYeQYoi+6AvMQVHzWJqi/rMNSt3Snhxx7rTGcQU02lyLE0Ir0DgihxnILE92YwgFLblWVCaXLop9YGNNySWW22MA+s0mlSCSCdR+WF6cAgD8WRvXRlv/SRCiE6KjYt6Kpu547+LBNdeFM1Xeftqa17MYfqDNpiFb7dEsSRbHVKNav8HCh5Jqkkl5tz71oLUbntXuEMcY05ZbrdrZAE1/S5/GYDpWJn9yUUhqTL1jRCzXu844kjlzL9sVMRMrXti5J+EWkkSHw97vjsnlvIt9HQY1DzvJTsEL1nqiS0spN1GEM2AtNi/5ZVQgVZBvB/MswzumweRcclktkbAKH9cik8DoDh+5+4qCoBYVnPD8tW/xdxgVHTXB341YZmbitCEEUroirP8+94QQuitM2TQsn0JLnS7PJjPhgyyKKNPGh7TzTIP/7kgC1AAMJQtJp70LqW0eqXT1mXUvJEU2nrMuheiIpNMQZdKYyIMLXno3fmNGlye/5aAAPFNtyOSNtAJTG7R0YkA9WpbEMAiMWYVu1/2FOcDXJCNqD1lFkk0V23sI0bUY3NWaKZeSbl5tzexa/aSJVUlIMEkpsbBAynPE0TprzNxLWouxFkVkDDl9QeYYnNLG20L9j6I23ZqrAbScklklkbASmM5ye6KBPXzTjAwo8WZRsqsX4ckioiGo7QjC9ljHQ+E3/W4RrUCKc14Wm5dteMEratCgKChsbaHGF1KyEUDcNRipAyujigYxGw0qSF3GINaQT/mxJAqjYXmekm2jjsXGBCBQzEjOqZQDk94yFCQCCM8gJE0UqUyy5OjbRkZO2QBQEAMAAAxhIwjC4rnO2LmgJCAKEjEP4OhheeoEGoF7rFIo3JvhULkwRo5iMExOuRroECBCG221InQ2RzYguCZOdbsLj5ASRk+UAoZNqO1gUCgkx36piEFICCdG4U3XMoByc6AcWAgdDbBAgNtZBBmnZ2f3P2z984EgSBEBoIlD/+5IAtwADNURSaeZK6Gjoil09CV0PGRlP1JSAKeYjKfKSwAXhxeSzO99p9zARBIBAdDxykwdTl7+sLI3LzlGOX0bf6CLPcM49JYllttevWLFi0zu+hXQyev9ZRsln8L+ks3ODyto8oSFKtiKNwwPDyaTLKilGKCCGTVZAQAAkEkkAb6PLCPU2Nhxq08j3l4AwTAZaoI3AtyUHjKs5e1YAVCYnITtwgIxuhLnC4i6jwIhYkUT1IK6L40CJqlN+ud2xmDXWf6esNgWUjSIu0Ve6S3v/X6kaU8i1e4KxVxnq28TMDFdx73rH+oR+H5Mr5UuhCFRF3UoVTKoXt943///2WNNr///xXO5S6nLFj3XHnz6YZNVkBAACASSQBvo8sI9TY2dGjTaPeXgDBMBlqgjSC3JQeMqzl7VgBUJichO3CAjG6EucLiLqPAiFiRRPUgrovjQInp9+ud2+YNdX/p6w1IsnzApLJrwt7/1+pGlPItXuCsZ4z1beJmJiu4971j+LCRB+TK+VLoQonBfilCqZVDFvvG///+yxpncFEecR88mj//uSAJUABMxK21Zh4ASSyMtqzDwAieUNc52UACk7Ia5zsnAFpJr5aJJJMKoBAkTyfZMY1aUSXajUZst/e7TZymR9L3H91wGAXhKBMon3/lZr7hL333+qvr0h73pfu8qneb5JYqLum/9f+lr5/mWtf4buL6zhvLRJJJhVAIEhvT7JjGnOiS7UajNlv73abOUyOxt07tQQA7CoFx43P6mq26GPPQ/2bbMR3uxu6TmPU96jpw8jux32bZjWWqtajr0Ouj2khoCmMRISESXmUIah6+/DSzI7c/ne4JwVfi9frlWv2mzoQgknu6Zn2WSZumZj+EnCnHqOccBoyV10t0Vpq/qWs1NkFOXHOKWg7am8zScJwp1i6rFsdNWxiJCQiS8yg5UNW4EaWZHbn873BOCr8Xr9cq1+02dCEEk93TM/RJMvpnR3hJwpx6jnHAepe9nZabdfQTTNT7IOPRzlaCZ6QwehMKURVZSRWx01syEEUa6/ClhNh4VsGCwQNXx9VBuPz4ZIXfzi+NfecxawoDAZNbTM2xbZkua1hqJSsdpeiw7LLf/7kgBugAKdM9zzK2rYUkXbnmVtWwpou2+NPWtBS5XuMaetbN9/u//7fFIO2QamT37XLzRWE4oEpZhEeeQy98h8yWWWl5UCMvbqAWMGAoQ9Xx9JRkOL+GOV384zjWt5zFq3UeITXEzJbG2ZH6WoFIMksbSHRNG7Ld9906f9vb4ax3EHVsWFn8uE4gO1MIjzyGXvmnlBAxIRKeZQhh+X1cWGTTyc+/5IAZc75FXVcrftQ3GyA6TqbE1HqzFjqi4ZH41hygk4jI9jpoX000Loub2N0m+6NBaaJgdRM3da6bP3bPmKz8zqBxI5wym4UeEEDEhIl5VCGH5f2IwCaePvv+SAGvO+RV1XK0+1C3JKDtbMSo9WYsdmhkfjHDlBJxGR7HTQvprQd1qN7G6TfdGpdkDq09fb75sYrPGcWBxI5wzwpDIIkRCRVzKD8RKzB8Emktaz7pKTBkmUHJXetumnWdHeEmMWRufn27D5cdOG4/qk4EkmCxjptx1mkw7oMnvbz3Dn2bmFtJznDWrW+yx63pTMcqWWXYfupeHQRIiEirqUIRH/+5IAh4ACzjVc80tq2FPmi55pbVsK9LFxzTVraVwWLjmmrW0pa97dTSVtb7pKSwyTKDkrvW3TTrWO8JMY0Xh+fbseeacPiDTJwfSYLGR7jrHpMO6BpUP657Yk+zdKWlznLvvbzlj0vpbYwqSLLufnxcB4MRMiEirmUIRBsy4c0AZNH3ux0E9rpl4DUVwrf9x281IMPJOR3MbwglSx1A6CYkPJMOA7QhWUlqO0q+nsf/8R8nGWpStov29z8/+583qehJCPJsc5csgi8GImRCRVzKEIguUunHgTJnv7sdAPa6ZeA1FcK3/cbnk0gwRScjmzGuhRyyx2FgREh5NKB2gxGSqqO1L6ey+P4i+WRaTZtF7gvbg2TU8IujyZ65dJIjkiEUSZplCWwLcgiuKTI1Y7xRKZZBaILaY9frd2kgCgCzL592Lru0yTuVMBWEMhADo2IgsxEkrc3W2W/lrl4GjVRXk+2Y4YvTW9frwPParU2Ca2vZ6njT5qZOvJEIolTTKEZhNyCK5JKh6x3iiVdkKILaY9frPuyyQBQBZkufdi69pk//uSAJgAAr84XHNLWthVhYuOaWtbC1UTbY01C6Foom2xpqF0ncqYA8K2BAJSxC0cyIsqXN12qfluXpxqzU49msoYqRDvX68OfHamwtUzU11PFxXK8nWAyjJrSXXUhdd6ldM2WT8FGpGuWbmWpirZqNOx+6Z19fGceRQibJuNqLj7x/a2t/L2LXU2qxoMLGe/vmBvMb19q41jGdY//rjOPS9M6jZiOUl6P4uJ5m9vhTQYhYWEU+GV29PlGXWkuupChd6y8ZlSpwg48Ydy9Wn+3LuNxxsfumdfXxn+EjRNk3G1Fx94/tjW8Zgxa+JrxoNsX8O+ab8bVfatM4+dY/xX4zjeL0zXeYjlJej+LieIu2OFNLEjyLiZqQPnu0QAAm2oiSCAAAAQCAAOz0YyzJe2lRsVbKE+4inlNQS5rHoAY1Lz1TqGEzNAl8dMIlaZmBhZV0+rn2dZiOTc4Y+cU3Nn+mq4h51q1M++o94O8R70tGz/nWfR84ZrLSPYsJ4FgVqxrf1TWb/F/aVz9b2YVIqU7I7UDbrX////vTP///7zs///KP/7kgClgAMRONxlZeAKYkcrjK08AVFxLWm5p4ASJCWtdzTwAnFijFqQQAA3IokUCAQACQSAAO8I5DoViyleDFYYafMtCzXmumB2kKUSkfJbVAXdDC5x15IpY6mB69amKLLjbrNHKFEifO6en1ekVheNrPrXpX597wd43elsfHz8+I+TVcyxG+KZJ4F4Vrh/v0+8+BfyL7nt7eylV0VO4c2Rt1r////3pv///95Vn//9fC6XIhJ0QkVnQKn4hiHtQMoXkfFYzqEz2tTcTExX/vbqcM43bn/f8V/VdbeampmnX1Nvu6Wl5OHSO0lE4oHpUkgDE8PwgyFRJJOJKLHW81O9yJ3FdzdPH/epciE2RCRatAwhicP9qCmF5fFYzp9Htam4mJiv/e3U4Zxu3dd1/X21b9u+uZljr6lxuuvRY9MuHaO0dxcUD0qSQBieH4QZCojtNiSix3JqddO5sztW6jcLj/vXyhKSSrqYL7wROAar1AMY5G8tXA239lFjPcbh/+kXE6JNI62zw5XqKooRIBgASQXWO+faqXqnVEwMBBRKpSj/+5IAeAACvDVfdz1gClonS+7nrAFJzMF3jSRrYUEbrnGkjWx/uomNUFniIRHUXZZ7GPWY2LAKJKypBffR931qt2AYxyN5auBs/9lFjPcbh/+kXE6JNI62z5yu8UhQhIBiAkj1jvnq6peqKqicMBBRKldD/dRMvx2bkjDaFmMs9hE2NQQA+LJZZVcqhADtQqVZvAd8Ls01m1l4BDPv6w3J+t/8bputo5VAZy5x9xZYSjfxsyuDahaHyPH5MTzoXjK1h5DA6xOfM3XMJhI5xpeLjgoCM6N5/7kEfiyWWVXKoRB2oPlVeCDvhdmms2svAIZ9/WG5P1v/jdN1tHKoDOXOPuLLCUb+NnLgwoWh8J5cmKDqXjK3h5me6xOfMtbdhI5fCZe154MPFwDz/3II3BIIkJiVczA8crdKI1IDMhdEqdJqnxgTQ+mpbkiKKm83Ws4amALSLZpoZplgmZmcPHRihFAWsc6aYlIHqFTPPIKaaRoki7nkkP/tWi2rXZLnEnVpF1YWCKNYaR8bkIgiQmJVzMDt4OlMyh9zIXRKnSap8YE0//uSAI6AAqIeXGMvekhT4+uMZe9JC5jXcc01q2Frmu45prVsPpqW5IiipvN1rOGpgC0i2aaGaZYJmdUeOjFBWAn483YSkByhbzyaZRTTSNErueSQ3/forbVrs95xJ+kXU1DUaw1+NJl0ETIwPvpgfiGXlqQS+hCVGwfdmLOAxiTSXUokhz/8kERkNkZox+j8Vd90xVegamisymFyLw9bEnDN04Fe9vbF2Z5sKoc8MxYyiUJC0OwiEFniYh+NC2RmWQRMjA++mB+Ii8tSC4dKpUbB92izgMYk0l1KJIc//JBEZDZGaMfo/FXfdMaUkmtTPlMOIvEVsScpul4V8XeMZZonCpVz3RZJSUJCZJGERQa9oh9cWyMy5iBCBEtKIP1A0vgaAZogTOCKdqUVmPwB6JF25w/TSsIyDsFxJ2YbguSldfUi24TROwwSNmRlWzVZDmZZ/i++yueqbtm2ab3/WlP/7Z+fPJbGv77xOMakA89UtVJSZYxAhAiWlEHWf6RwqIv+QInBFO1KKzH4A9Ei7c4fppWEZB2C4k7MNwXIyLZwhv/7kgCdgALCIV1zTXpIVqQrrmmvSQu8zW/MxethdRmt+Zi1bFA8ixIl0MYcxElTzEgJcSpsyk8lS+yDpLdavRQb0l1qPnErVJuo+MaWAPPVLVSUmpMRIiJFpkCKvJBstiDutZM5LkecH5sahKRPh9a6kElPx8AZoA2hoks6ZKJf/rIy5ByqLQGRka2nmaUdvq6SORy+WdfqtqGtcyzY8zc1/996r9jNdNYayWxc0piJERItUgRV1ILjNyAnFM5Lk+cLzY1CUifD611IJKfj4AzQBtDRJZ0yUb1/0jNoOTRaAyMjXN6M3R723SRZVPe1k1PaLaUa10Pc5Dtr++/qXwxmunDWS2LikMQEiEhpQCHIy60rwgFN4wOKaZYit9A2FmgHwJBMzUmiceyLuQgNEkTc2VcxQbWtYhLR55IkBQAa5EjkCjUrmyYghtXNxZTcyHc5lKMeyzbG3Hx98NsZp3/9fWb/91FmRJGIiRCQ0oA/EZgaN1INSWMFimmWH5tIGws0A+BIJmak0Tj2RdyEBokibmyrmKDXrWVVHjxUQgEAAzL/+5IAp4ACzTdb81Ja2Fmm635qS1sMHQtrzc0LoYEhbXm5oXSMcUMGUtmyYghxULcWzfIhzJlSMe5NuX/j/htjNO//r66/+6ixwJpjISMRJaZQfijguR2Xna6cr5RA4EeupGJeA35PpZ+mSemcRJodQgeuZLyBuIk9wT3NbKbApcm9h6HHmr++LO1//3NyuhY+TBlbZa90fF9fNNlzv/9PQQ70zTmQkYiS0zA/E89cam3+fk43yiBwI9dSMS8BvyfSz9Mk9M4iTQ6hA9cyXJA3ESe4J7m+nAUpJyxzLc253xZbX3/225XZJMfC1tlr754vr5psud//pwkc0zVMhCBGQkLMAOzO0L+V3QfcGZ1jvvjZTQKIGSXJrR2KZJPUxoTwJAhMk6lu5MH00TqOmTd01gUh0uYdJNq1VpZhDkmVyvdHGvTMDZhgO0kqOclmp9yffffzWjTf/4d/H9ft5RpzIQIyEhZQB2b0RcCbfRaYgzrHffGymgUQMkuTWjsUySepjQngaAhMk6luohh9NE61lLdSRieD6L58wRJFM6zJF6VI//uSAKwAAsk723MzWthYx2tuZmtbDFULac1Ra6GToW05qjV0GRkg1Z92NEUzM4kgcJUxOKpOaupNW99bTFkf1JdXbo1mIKZSEBIRIaYAg2K34Onnjb46JCZKA47kyywAv0nFZblknKpfM0ghIRIzZZk6z/WWOkUSQzE8SY7QFIo5kyZfatAxeZoMy1LUaz6Y7C0vD4kbuhpExjVm6+s9TNVfz32RDTsZCJkJLzKEEztp7Zc7LdjyuJnnTiOTLOAJSkUU8tuWSc5mZpBCAIkZsspPP9Z5zIiJMVHSoXx0g+NUkTJpu1NRi8zQatS1Iz6ZGFsvEYpN2eooMzNX9Zrc8c/nv66uo69uxkImQktWwVXueCN0j1rwMjcHgD6VOqSLIBujNBBaGS2tZOnQ/IkFtRTk1arItNrKMkikMQMxuZnHmKa6pLGiZon9R90EVDtOEkgXSgXGqJMolxZr2bW065n+s3233gC3YyETISWqUKr3PBK6jtqGGTsDwB9KnVJFkA3RmggtDJbWsnVh+RILainJq1VItNp5RkkXh2BrNzM49P/7kgCuAAL9O9pzM2rYYUhrXmaQXQwE723NTathbR3tuam1bFNdUljQzNF/SP0GUTVE5kTxpqL5RPL9utp1zv6zfbfjAKZzIRMiJaZQdmggjr6wEtkzeseAySJYpJkwB8qSFNA+mUCEo1ppEkKpbMXqZJakz8zNlMjubgmzc1RTXNFTFZoUUCxX1H6cnmqRCRUoxqWbWbqR51Zodlz9A2rciVIBymUyETIRWmUHBoII7Su0tkzu0eAx6JYpJkwB8qSFNA+mcJa1ablsVS2YvVklqn5mfQZuXwTZTNUU1uaKmKzQooFivUp6ayTLqRHNVKMall6zdSPKzpotE0/QNq3IlSBCXcyETITWrUIO5BUxD7yQs7oSItw4/paybAtaJM0UmhLBryikQEEw5R1GKpIqdnSXKDc+YhtkM8xgYZkp1UXmaDbPSprN3NDU7HmOsrNzFRT3qfnTNFjFJ/qPaLrxpCXYzETITW7UIOswVKJe4jrnZCPRsDj+lybAtWJM0UmhLBryikQEGoco6jFUkVOy0lyxFVZ8xDbLTzGBhcklG6n/+5IAroAC/Dta81Nq2F9Ha15qbVsL0O9tzNGrYYyd7bmaNWzRdJNBtkqUzWfSLhdJNAeZHcrPl1RTbqfnU0WMUv1HtF140gDYYxEjITa7kJa40EPDJIBbIO3JJy9kzkBA/APPQNZYfWooG4gKN+6Rz1dufXmzh1657zZQyOmPcPEBhtGgbtun39/Vc6xfcDTtekY5bfdId779Kb36YgWzaMZ1naPGEchjESMhNvuQpX6gB4aCC2MENyScvZM5AQA+HnoGssPrUUDcQFG/dI56u3Pr6z2j193lBktkzHmWFAYbRoG7elt//Vc6xvwLxl6RPyvqT0f3vv0pveKeBuslk6ztHjCNQ5kImQmt0oQDPPReonuipwqlAEATV2sfQG+l5alH5wr6kSqUgxwkrIHcos9SM4iy3mSgeSAicUarWYMyZkXKbKTZaFZnd06FiYmX01LRWlWtT6aZhUmml95/c2tqaiDIRMhNapQgGeei9Ous/pwqlAEATV2sfQG+l5alH5wr6kSqUgwYSVkDuUWepGcRabLOQoRkLVNa0GZNJCmy//uSAK0AAvg22/NTetheptt+am9bC7Ttb8zJq2Fzna35mTVsk0FtWZu7mdBNiQTL61LZaVaKnqWmcqTdL7z+5tbUgKlTISMhJvtgh2SSp1Jt3GZmUtoHu3K8FnCmALYzNL6RC2dbGAe0Ox7KbDlTPxHxIq9UxnVC6i9xBiN1od67zaHSt8Q75167zh6xuT17uWZ9Daqz3mxBtnePuuKYzaCbxTcjUTqFMhIyEm+2CBaCmgSbfxfZlLKI7t0+CZwpgC0MzS+kQtnWxgHtDseymw5Uz8R8SKvU2fmhdRQ2zEbo0O9d5tDxW+L5zr6nv4Le5PWHEOZ9Dbqx7zYe2zav3XFMZtBN4puRqJzDmQiZCS1Sg/lDWgWJOCzIylxGqhlN9CSgHZJEDd2PuZj16zUZcVGpNPmvzZ7afmf1yYJDRRWeK5Wo8s9fvmoOLv80fstknNJp26te5f/Ms3Opa//W3I3hmYcyETISWqUH8oa0CxJ9WZGWsI1UMp6hI4DskiBu7H3Mx69ZqMuKjUmnzX5u9p+f+x2CRCFZmKiVqPHZdv5qDv/7kgCvgAMcN1tzU3rYYybrbmpvWwsc7W3NTWthXR2tuamtbC99mk9PZJzc07ddvl//LNx6qv/1tyN4ZNljIRQiNqtAf+H5hyYw7cOHOwPGOhBmedBUMMVlJpR/HqkkUyuXQkFLqrnn6u9c+J60zr/5KBGxpn0T3as+8sS16a3/XGNw9w25luolyuXzflZre2qSbxf/+X+JULvrP0eWyGMhIyI2q1B44vMP7GHbhw53B4x0IMzzoLWiFZSaUfx6pJFMrl0JBS6q55+rvXPietM6/+SgRsaLGmzeFn7libvStv9e273ht0W6iX1y+h5cc5tWJC3i//8v1EBcnifd3hyGUxEjISFmUIEymX8mXqJAEZn3jp56xaylJ5HQi/vdn4NsfrGhq2msufz/z3LtOo1yy2mWh0PkQvSSMHH0+o2nay6Yv6kmUelSxikoSiJcM1mJEUbH86tBVSLqSNTy3+baO1dMpiImQkLMgQJaoX8oXqJAEVm3rp56xlqqeR0Iv73Z+DbH6xoatprLn8/88c138HfMuveZgouQB7JSlkCvB7X/+5IAswADEDbbczR62GIGy25mj1sMXO9pzeWrYX8d7Tm8rWx8tRv/h0wtmCofSYTDUkK6JEhd9assj23Dmlk3/57o7VjXYyEkIiWmUH4kGn4n34cc6DBrNmcA5b305aZ7ut5fMt5zX50uTdFP1e8scWTtRg+X1stbGAqDAHDZielm7pzbMmerpJZ0/JpoeN1MYpnTEpoPVPKam90T/6j1jhByOuxkJIREtOoUDk6fiffh3zmGGr2ZxHKtwNKpKzqWlKItjKpl1IWgTUxdjRpO1GD5fWy1sYCoMAcNmK0qjd1zaoyW/3dpWWsMU0KBTQKBdOnSaS5gnVPKZSbqon/1HrHCDpuGMgQyElpkB44vDD/xB42YBWEVsfzl+cyxOnLP73O7qRXX/lRVlHFOcMvr7m7Vz+ZXeicMgyIpIGGVH3VNczvvWynj6fUdKBaZnTBnMTpap+YKam+iavuXZXyNwxkCGQktMgPHA8MP/EHjZgF4RaD+Y36LLE6cs/vc7upFdf+VFWWwp/DL6+2TaufrMrvROHAyIuxcqKndU1zO+7LZ//uSAK6AAvM7WvM5athhJ2teZo1bC2Tda83hq2Fsmq15vDVsTxpPzEjFpmdMEHNTp9J+YKabvBV9y7K+RJZyEBMhIqYAh2T0r5xVxnZOFcodfCPbz/Rq12sMLtrs0/ff+3YvIeNXyy/DWdLb/e7W4qnPRxIB8EEnPPImKC4vx3Z3q59TDmLk04NRYMNQinkZJfVk1ZalE609f65SWciATISGmAH9kVV84q4z+nCqTatEj205wDKqzZBA6bOUhxvm5oeDOBipJULl161pLskuviyACsHJ970mKGC/5n9XfNv9kUue3DEmQ1ylqpmjnfLWfNN3qR/PH/P//PqU6EICQiK1/g7NSbgDboKLgT2nXDdfHuqExoqe5+71mbb7v9p6uaHR8+/3PeUV8rck5tfyKwGyfdFbYU4806hl/bJyhFjLklNN1Td0ybWW/suoras7OJt/d535Sal0IQEhERr/B9YYlcAbdBN8CfUr4br4uosgYREXzlZ41KYtz3L5imGiELunyj+TkyTm1+8VgNk+6K6hTjzTpzL+2TBgixnJKafTN//7kgCygAL2QtpzOVLoX6hbTmaLXQuE7WfNZWtBbx2s+aotaLnNrLf4umRUrOzibf3ed+UmgIZiEAEQEpJyMCDt07q1nZZUaqIUDoLiPWkoEE0rrN0iylsZLQCEQ4H0FLJ/mBVaTiP+mRRmPRsscv21wjE06+bvOJxBUtKJxpQWG66pVM/pOfvyttdHb/+X/xfFfv9W5ZiEAEQEpJyMB7bNO6tZ2WVGsjFBKC4j1pYBpNLWbpFlLYyWgEIBwPoKk/zA1RaWI/6ZFCY9Gyxy/bXCsazr5vzicQlUonGlBYmu8lNffqOfvytrejrv65f/F8V+/1buFQxEyIm+1ByYnGH1pHbRkN38CEjAI51pTAxKJkZmWlGIwGoImCxXhMNzqKzz6jdJ0UTflYugczdE8pBM6Ym6pLUnQetmrWiYH0SpAWpJmqjMtPGZYU+9C3dkTLq5tsUfvIXCoYiZETfag5NeMOzSO2jIZ3ABBIwCOdaUwMSiZGZlpRiMBqCJgsV4TDc6yzz6jdJBaKfKxdA5m7HkmTOmKapLUnQetBCuiYHzQwT/+5IAtgAC+kNZ+1Na4F8Iaz9qa1wMTO9rzVGrYX+d7Xm6NWwG0f0ZmfYnlAh/Q+7ImXVzbYo/eQCoUhATEhSbcbAdCkir8WXSZiZHWNCYMlVKlRA0y0kU1unIwUVBKcL1MMxqMM43LbkkklqKxMQXiWRTM1sVukemtlv2ZZ/YrWOMumJMZRWfNiCmXquvzRnUY/z3LayNQpkJIREtUgPpMSGHMX2XiYzAiwq+ESpUlogbBuPJmt05GC2oJKOE1Nw4DUYZk3LckkkudHKD8SyKaa2K3SZjVkVv0EVn9itZJl0xKmnT5sQUzb6/PHnUY9Js9y2sjdMZiSEJN9qDy2H/kVO/jlmcohj9acdsPWBq0hXRpmiywZ3TPGah9h4d02cnsylqXIKfOFwOg7jMpnzU+kXD9FN7pIe63y/H1MfnHCXGKymyZdM830l6tmJm2fkPFEZTGYkhCTfag/MghuRU7sOWZ6qGP1px2w9YGrSFdGmaLLBndM8ZqH2Hh3TZMrZlLUmxRT5gYB0HcZlM2NT6RgfdFb3SQ6nW+X1E03H5xylx//uQALSAAu07WftUatBeB2tObo1bC8Dfa81Rq2GFm+15qjVsispopkiZ5vpL1NRQMNs/IeKIiXMhIyEiqlB6rnHffZ0VFjEoIOApLDNGtyGAa4iVF3W7jFoLWWDEN2N7Wc3VvvLGQX/NwUCEMTHyVWSOJg5vN0v/j5s1RcVZmbLKnuDrvZ59nmjHvon0zPUfMRLGQkZCRVag9FbjvxKIqLGKQwcBSWGaNbkMA1xEqLut3GLQWssGIbsb2tXq33RZEF/vuCgQhiY+Sqyi4lhzebu/4iObNUbIKhqJyypO2E13nPfHoMe+i+mZ6Q+YqHMxEzEm+2CBM4ZfuGIHfw8YhbBkEGZ5fAtmG+YKRNJZJLlGmF4lllrMbF5q0jWxcWbkyswCSC8gTz5NNUkqymeO00FNvV0SWLhiOJzw+sdoGKRQqXqfOMm9nf57bfrRUOZiJmJN9sEI1DL9wxA7+HnILYLwgzNCXwLZhvmCkTSWSS5RpheJZZazFNi81aRrlxZfKqzgSQXkCefJpqklWUzx2mgrvUvNS8YGI4p4fUTOgYqK//uSALWAAtc32nN0WthcJvtObotbC/zva8zRq2GBne15mjVsGvSVnGTezv89tv1kAPmgCySNMAQdKpLQXYMUTGfcE5WrxtJkDmCB5MqjVh8k5U5pOieRb61HFpGKaS0DfBk901ThUDChKtbNSbqxJ5/Mf368ISLjqpTA/vXRJw+j44hff61fFdyeuv+Z//7/54PQxkACYiI0wA9saktBdgxRMV/wDlavG0mQOYIHkyqNWHyTlTmk6J5FvrUcZRimktRvQLXufTHCoGFCVZzNSbqxJ5/LP79eEHiETVSmCHefVJw+j44hff9fxU3nrr/mf/+//uD1SpkJIQk1WoQe/0FxSjhx7jsAJm2Vx25jjKj7lgbXNZbxfL9b3j2GGPfvVf2FG3evbpZ1pFYVE2zBB1bvfkxksd/73Tb0j0rEZyDjJOR/zvK8RP8/DEbr/16+gWI1KmQkhCTVahPO1BcUo4ce4BuEzbA47cxxlR9ywNrmst4vl+t7x6/jHv3qv7CjbvXuHsitxWFRNsiIX7r35MY1jv/bc3lT3mRGg0PFqsj/nf/7kgC4gAMLQ1njVFroY0hrPmqLXQuY7WvM5WthcJ2teZytbOV4ZP/8HEbr/16+iRCZQxASESFmQLDuxCA5h00yDDaRXD+WLdmtETAgr8wqTvxB7f3TXJygHBKbf/U/N4dDzSJPO52nxVQ7iZkvyq3uXJfUs+fnZB4rbBAnjcxUXakQh8v5iKiPazc1C//g5yV9oDmUMQEhEhZkCkd2IQHMOmmQYbULofyxbs1oiYEFPzCpO/EHt/dNcnKAcEpt/9T83h0HzTzzonRPiqh3Dsk38quXLm/UofPzsg8VzkC43MVF2mxCHy/mFKjnRZTpQv/4OclfPgOYUxESESGmUHkweG1EX2UNNvrVDHHaqssSoD7SIJpqPx+JbRMkjwlIhHXM8ocedyvcedCjQWL44JF9bLo274vn51GnThtRu8gmJwXlCtHueK+4bHynfdJLflZhTERIRIptyQB8uPDaiL7KGm51qhjjtVWWJUB9pEE01H4/EtomSR4SkQjrncocedyvs85hhQFiO7UNL62XRt3xfPzqSdMjbN3kFStmZgrB7mb/+5IAuIADFDvZ83la2GOHez5vK1sLON9pzUlrYWwb7T2pLWgr7hsfKd91C35UqVIQEiAVphB941Bkop3Ii5wipEDicA6SQIuDv42zQwM0o/FrUgpYZ6YoFSaLQKrVqN2H1ZuUzUvmyYKeXiTYulJZ83pIJlFkPW9fRJxPWUESakOxRwdhSNWZbqat1HKFZp+t/PfDhGpUhASIBWmAHrf6DIhTuRFzgGR4HE4B0kgRcHextmhgZpR+LWpBSwz06gVJc4cafNo+lzeO5xWONYYbEx5iuWZ4/tS7rVP/87+frNWxr0yVg2YMQFI5Vm+d4187xJ6fxPrfR6shTISIRJqZQhEMO1L5h00XDF4BSyGIpfMSkEBgAcRW0tMPxV0ThPqAglRnOVD9+89qvZFNXkHBuNjMkvOu9KK4rOff6lwQKyCuds1Zl1RPF9etCdOrX//z1R/w0nIUxEiESaqUHYdh2pfMOmgQMr+ZZKIpfMSwEAgCcRW0qMPxV0ThPqAglRnOThu+s2kZ5ljXPBAH4qGRVclOSRIzIykm+guUoJJiGyWP//uSALoAAzo+WfNUauhjhvs+ao9bC5Dtac3Ja2F8oa05qSl0UQdJUNo9sshGxzS/8m6H/8hZIJhTERMhJapQg6pBMxMwUsk0/lktA+1KkmMoBxg4thPpnHWRw7L5gYhb+PCRlMckmQrNI0P39RQaC8YIJbHHDREHc2f2ZmtHovch0PFoNa98QcZcRe/D7xNUO4r+G/k5Tr0i8wpiImQktUgQdUgmgmYKWSafqyWghqlyzfQ4gVzJfnc7uPQJ/f+pVRPhGVb6vMT0m5mND9+VFBoNyBBLgWHjREHc2f2ZmtHovag8ws1FXR+IPDRF78PvE1Q7IVHqVOvSupYzEjMjb7YIH7MPZXdx3wXqPVtLkvMarcj5NbPYqV6bckc3mWPy3NDGL8/tb5JlXTEaknnM8eoxDEmPWMUfKb1WqbJi2x/b2vTadJxYZQgc67Luvjh2q/4vmv4Ocmp1glI3LGQkZkbfbA8+Uw9ld+HLBeJEm+8l5jVbkeprZ7FSvTbkjm8yx+W5oYxfn9rfnKvYjtJ5x549RiKJQ9ZWryl+q1TZMW2P7P/7kgC1gAMTPdpzVELoYCb7TmtIWww872vM5WthgB3teZytbPzp50nLGVMOe+S7r44dqv+L5r+DnJqdILIgp0MQExERVkBrkRiT/xB90OBhdQkRDFi+pIhoGoeHlus1koSKsydISoYTZf59fn1kXyioDwIHrAgeQP/EXv7/2lblUUQw0I5gq26lutfPj8bFwONfiWvrglToYgJiIirIDXJTEn/iD7o6GE0iYEMYX1JEyBqHRoi6zWShIqzJ0hKhhNl+p6xWPrGXPCoA4ED1gQPIH/iLV/f+w1XlSKEoiCcw1u5Lda+fH42Lgca/EtfXBKIciAjERGqEITOO5EocfOBDZTJ3FoSTEwTNAMnHL71laUhP6TbojPCN61lzJSZ8PPUmIr/suKSAFp6jhsc2F8VBvbXpWz/Vh7zo/MOk1AmntS9Nn//fUcaX/8r9ithYJxDkQEYiK1QBCZyHIahx74ENlEnYWhHMTBM1Ay8Uzes2lIT+k26Izwc9lolzJSZ7JNmpiKfZuLiSRBaXNOGy2wvioN4baVs/5h71iGo6PqB09ML/+5IAsgACwzdZ83RC2Fnm6z5uiFsL9O9nzNFrYYGd7PmaLWz6bPn/vqONL/+V+zsLBMCccxEjIimrYIOkTvzdC9Cjo7Mr5vyidzzgY4HGPSzlWvrFuHNdudxukSW/5S/qmfqs5KTNTVLmwFTraY1y6JOll1PxSlctOHjddiJQTR1FCx6IVb2p/L5pf9Ov/1uK1xCQnGIQEyIlphCDpFA8ToYMYyQwKyb9JZzzix2SMell6rXwxbhzXaDuM2RDb/6X50prcxQdEkSOYMYkJFQfkjcxOo0zZSyiUHbqZTVomiSZ9BEmF0exUxtUdbOdaa2P8zb897coMi2MxJCIqq1Byb8vaxF3YcMxkcS/pvy3DtukN+oaYi+cxr+O3+u6rYzKAyz3571EpFSNM8aF74clQEgq0CCP6G94ssa3Ov6IMHK4ns8kQ6KtSUciP93rvxv/+PoqtyUUxmJIRFVWoOTfn38i7sOGYqKJe1F5bh23KDfmGmIvnMa/jt/ruq3JlCiz357siUYuSOjGiPdU5MgJBWLEG+hveLLGtzr+iRRsicee//uSALeAAwg7WnN5Wthjx3s+by1bC8Tta81lC2F3ne15rKFsSIaDLyUchv95rvxv/+P7rF5ceYEhEhIlpgB+JNTPVPOraEAApRpl7v1coiIfUraPdzXPdy/lnawsWET+9zt5tANbtRN40BiYgHuC6TB6ECdBw0R9RBnl76ivsxixKMcJz5H9YeyacLr8JF9Xul//k00W1IeYEhAhIlZgB+JNWeqedW0IABSjTL3fxylIh7Sto91tc93KPLO1hYsIn97nf9iA5u8TfIOVjHkPpMEZCBPjhof6iCtS99RX2kC4lKsMiOg/XD1xxx9fCRfV7pf/5L00WyyJpxIBMSFWUAkb80j1zb8dJSweTUdo/z1mCOyIeD9U978mfSzL7nf0yFm+dPl7YIKIsy/TW0E3UcB5RERF45NoYUn2zEXDEforPoFCVKruvqLfLm/xMf74Udqemi1qETTiQCYkSsoBJ35pHrm3c8hKB5NR2j7nrMCekRcH6p735M+lmXLncKjIWb50/fbkFEWZfq1oJuo4FUSQC/ObRSJ9sxFwxH6Kz6BQlf/7kgC2AAMMO1nzWULYYQdrPmsoWwvM3WnNZWthdhutOaytbCK565bFva5v8TH++FHanpotbQCZcTETEiVWAH1h5/YZfx96gyEA8bSVpsc6tYUyMGgSpes9+advuU5csan1hpz/98YPstf1CtjqEUVNQLIw+/oeknfafRt71QNHEdYOO5UcPEtm/8r/6TA7h36ItMuJiJiRKrAD6w8/sMw47eAyAA8bSVpsc6tYRXGDPJUvWe/NOX3KcuWNT6w05+P3lD7LX+grY6hFFTUCyMPv6Ho4jfafRt71QNHEemOE8SSOcQ7N/5X/0lh3Dv0RaacjEkIiqqQHAswU78YgOgEYM75RICEWrPMGQnFKPB25/ev+IQPcwsWccW4qWUn/mdzBev6xZEgKEqUi51Cs3v+ytyCvddb4jnLokgrJA3KVdJNtA1X/9xv3/WpO6W/UJZpyMSQiKqpAdizAUPxh65oZAnhKJwSC1Z5g2M4pR4O3b3r/iED3MLFnHFpKllJr8n4sF6/qCyJAUJUpFzqFZvf3yuKCHuut4I5y8kgrJA3Lfan/+5IAtYAC3Tfac3hC2Fzm+05vCFsMEN9rzWUrYYQb7XmspWw2yR8v692n7/lqTulv1CWGYjEjESWqUJmBa7vw0/EcHRp9E4k5pcLtuy9AQIpHevYc59+GpjF97eVFS08Zr8ufUFy/BqowDQXic8hROYDj6JBRQfCt3RYyrDkTiZBXDxQWgcL2eew4Rkf+K5+U9WPv/805J9QKwzCYkYiS1ShMvbQuPDTuRxhZ8k4k5pdXbdmkLpFI717DnPvw1MYvvbynKWnjN/+/UFy/AqajANBeJzyFE44HL0qGOFhW+ixnYciOJkJQRKBaA49yz2EwjIPv0r05/Vj7//NOSfUCusLJJKWrUH1jTiyKcdqmZYaDKG7D0UqnzWtAqHIH09PpBDAQxzI6o9eOly4lRWzbtcW2/872/sX1SKxzjp+Bl1J30sKDCh71iLn/cPs71Wq9TT3VzgykyUzimFRHvrGMVzmR7qDW25dqiANyu8sIyGsLJJKarUHppndkVE7VMloZnKG7D05ifNa+FocgTT0+kEMBDHMjqjVpc8fEqJdf8Kam//uSALeAAzk72nNYQthmR3tOawhbDfjhZY2x62GrnCyxtjFs3zO/ZfISlQwVvkumomrLrwbZv+x28z++rZJJ2mVWMjA9BY6NROLDz/TOV3YHehrb4fVEAbld5YiQ9rZbbjjjjYEcf3N+Y8/UYeI96OC2S4GgCoAsFwRbc8hJWUPFJ8BQA9F9jG1JNKO561rUVFQ5BUACABB8LFHzSpdrKrUawLMWHJrSUAsFhowWOJ2KGiqxH2aaUVzFqSrlDF7y7VQqCYmRmjjjjgD+QzTu7JIVggQO+DktpuAmAKQTUFLbtISWMeKT4CgSot9/9oUNSTfPwllWqhIRUAIARNKXvPGEpxjlXGNLNKikUtUWCz0MFiYhjJK4x8PLapqUv42hZMSwFyj0wKaWoJbcjkjjYEI91n4dqr10zsZp9neH8AWAGFesHeoLNPfcGCur0gP9xs1xmLLuv7HixWUW/mowbPkVUZA9h6oXVjLMGTuMEomBtDwhRhEoLMOWYvWt5OphNZ0dUIDLc6wesMlLCD7lwCt21221oCVrbDCd+BZhSnlvNv/7kgCigAMlONhrCULYZqcbD2EpWwzBEVGsPQuhlCDrNPehdeMnwgN4G48SumGV/Biu5Kvo88atfuDNNJO1nCwtYzeZVjTWU3LoWB4447dWpyhY0yhYQROhsUMNSR5YtSk7DTXVSYSztCRs1JMVUGlETOKr3IAukmOSSWSNgQj6a5MwJdfI1/avnp9Abgu0MPN9a++wZeQ/bOIu6xb5trOLJXd/kMiaRKnLfNAsyfaoTOp2tHTjkDCQVBx8CknUe/1YY192Iz/EPGmH1v95BTrWK2XWxFGfEyS2S2WQCTat4yl9YlBR2CoRlgwP0SOZzOaPvFYS3fWbZzmfT2STGc0rVnz9OVW0VTaQoLo8s5qpxD2PqyRBVTWENQ9yTZ0Q8UOpkGO1Wg8fjagPMa7mscXrBmqShRIONXLwCbckksjYB44gSoQ42HIQca72E6bl8WRAOm7ePqfvaQd5hK7E0O9L+ltW3Pwr81vY8yxBmz7hThd5Hk22qufRUrbDjFsdevYUrNou646cy4zpVaVqfeJhPFFhIw78Vbt7t9rQHt13r97/+5IAlgAC/TxT6w8y6mLoKo1h6F1LnQVNp70LoXygarWnmXVVjAUE9kme3svZBCYyy+9rZcMUbmSeM1uN5bfNdv9SP42i3ZnyH+e8Fixqsa1Jcr1mNuwjSKDOacm3Wbjmu203K+wdrSbHOLrK9ZsduzRXTBECACWRI1Rlbba60BKfb5FLVSZAC8/Xr2I3URgz4r99evkxSts2sp3TLXMlv8eu++7msVNSsp3jN/b1Hll3/lkiDHJOx/v0RYOMLR9D6Ay2O/LY9Mjsn7/Pu6ShTbrHbH06iWhE1VWa3a60BNWjWbjSoBNCFPFFWE+YhD0Sqd+nzK/mrj2iusSfV9X+sYj8vYnoayAYaiwJfqGLCRxi1Jg4daT0IHhICxhxQv2cIjP0FBCC0JBfoIiUKg+5qUHDKFJRkYMsttutkAHmednUPsKw8IOxJQHC4VE6/NRf3fQhqhUTHwIVy3CbQ1WGc0VFRUcvDjZEly0Q9Sa6lkKx0UaIRKmiAQxmIiIO9JSEuR1DY+Ct6XvSuM2DihxrYijKzPv/vqAfWsdAKrJIx1Om//uSAJWAAvpD1HnvMuhfaHqPPeNdCykPT6ghC6FnHWq895lty8m5RopiJmmvi8ee3zTEe1s1zWzjwgxr4F93aJMkcSILr992Dcaez56GbJdvcaSlTJPievR6ZLv4drwgrnN+twGFuEchdJATgRFENEklkbAQNIEA8EnzDAcVLXnziIK0HLFqSitZgmku+ovMxge9R1qqPVlufpkHl2J2lvf57Ju3/jwqzStVjw7bttqVtRWO1oVPS3ZzP2NzHRKrGP3bxoUawIoys77f76gJr6ycafuMkhjI4a1FYxI1AqYFNfEOFuXWc7hQ671ve/ikHXqYHdtiz9qsekf/+z9n7fG7YUJIaiV51vCzk14RNWnDEyLVLNOWh3nMazS67f/f+6moSUm2m2kTAIg1sRSCJCAEEQsJkSJEiksRIYxipMzFV/Zm4c6ok6VBUFVBoFQVdkQp6sq6VDURAzg0Fep5UFXdR77nxL+itklJJJNpEQAMIwRDIIjrQCiQUstVaywS+i4rOLva69oT6tfgMBCmb2ZmbVmY9VVWUKTMzMXxmPP/1f/7kgCbgALRP9L57TLqXKh6rz3mXQjAWUGkpGchWxRn9JeNLESr3h16hEDQdCrxEexEVOth1Z0rpb5ZrR5FPVkgGrqKgpAqPB1QNHiLRFzsSyUSzv/95WdntQVh1R5pHK8r/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////gopJACAniIaCoKgr/2ZFUrOw6r/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+5IAsIAGZwBHSAAAABMgGNQAAAEAAAEuAAAAIAAAJcAAAAT///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////uSAP+AC/AAS4AAAAgAAAlwAAABAAABLgAAACAAACXAAAAE///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7kgD/gAvwAEuAAAAIAAAJcAAAAQAAAS4AAAAgAAAlwAAABP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+5IA/4AL8ABLgAAACAAACXAAAAEAAAEuAAAAIAAAJcAAAAT///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////uSAP+AC/AAS4AAAAgAAAlwAAABAAABLgAAACAAACXAAAAE///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7kgD/gAvwAEuAAAAIAAAJcAAAAQAAAS4AAAAgAAAlwAAABP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+5IA/4AL8ABLgAAACAAACXAAAAEAAAEuAAAAIAAAJcAAAAT///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////uSAP+AC/AAS4AAAAgAAAlwAAABAAABLgAAACAAACXAAAAE///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7kgD/gAvwAEuAAAAIAAAJcAAAAQAAAS4AAAAgAAAlwAAABP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+5IA/4AL8ABLgAAACAAACXAAAAEAAAEuAAAAIAAAJcAAAAT///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////uQAP+AC+gAS4AAAAgAAAlwAAABAAABLgAAACAAACXAAAAE//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////uSAP+AC/AAS4AAAAgAAAlwAAABAAABLgAAACAAACXAAAAE/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kgD/gAvwAEuAAAAIAAAJcAAAAQAAAS4AAAAgAAAlwAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABUQUcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
      break;
    case "ohmygah":
      return "data:audio/mpeg;base64,//vgZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV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adJWGpCsRo3Zd2kdpxomnKgFeZgKYq6YrKnacp/rEqtXYZltAypY0hfZnTvWqsZpbO8eVo1LqFwWc35TGaXmWX7/94446lUa5WprWLAyEFdBeiv6b/+C9FABb1ADeE2JceoNkCCTUT4BaQIrwYSbJSJqXk3hNmglQuRlP0NOlQvbZTpbScmS8L8PUqT+IMXJRRoL17GhH8JMDmEyP8BtABJNhHQFkDCOFkJUIUIchKmIMPUhzNdhVsauFMcyihl9Jyoms5SCj0mS2CTBIlQK8EiLEvltOmAroiuV0aCrVa91l6nTRNFQthbiFOJ/FuOpmu9Vqtjf4turCrdtqdQ1DWVqOYnTKpjSNJDnKChp0zsKhiwn07arZ2FDUNUMVuOY0nFTGkaSijNpynTOwoay6tb13VhTqGsshzFydH8TouSiuwoahsaCmIKaimZccnBcZVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVX/++JkDg/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVV";
      break;
  }
}

function notify_transcode_amount(mp3_counter, seeds) {
  var transcode_sound_notifications_enabled = settings["alert_amount_transcodes"]["enabled"];
  var transcode_desktop_notifications_enabled = settings["desktop_notifications"]["alert_amount_transcodes"]["enabled"];
  var transcode_desktop_notifications_triggers = settings["desktop_notifications"]["alert_amount_transcodes"]["triggers"];
  var amount_transcodes_threshold = settings["alert_amount_transcodes"]["amount"];

  // aat = alert_amount_transcodes
  var aat_seed_threshold = settings["alert_amount_transcodes"]["seeder_threshold"];
  // dnaat = desktop notificaions + alert_amount_transcodes
  var dnaat_seed_threshold = settings["desktop_notifications"]["alert_amount_transcodes"]["seeder_threshold"];

  //console.log("THRESHOLD", amount_transcodes_threshold);

  //console.log((mp3_counter === amount_transcodes_threshold[i] || amount_transcodes_threshold[i] > 2) && transcode_sound_notifications_enabled === true);

  //console.log(seeds >= aat_seed_threshold, seeds, typeof aat_seed_threshold);
  //console.log("fuck", amount_transcodes_threshold, amount_transcodes_threshold.length);

  //console.log("fuck", transcode_desktop_notifications_triggers.length, transcode_desktop_notifications_triggers);
  //console.log((mp3_counter === parseInt(transcode_desktop_notifications_triggers[j]) || transcode_desktop_notifications_triggers[j] > 2) && transcode_desktop_notifications_enabled === true);

  //for (var i = 0; i < amount_transcodes_threshold.length; i++) {
    //console.log("sound ", (mp3_counter === amount_transcodes_threshold[i] || amount_transcodes_threshold[i] > 2) && transcode_sound_notifications_enabled === true && seeds >= aat_seed_threshold);
    //console.log("sound ", (mp3_counter === amount_transcodes_threshold[i], amount_transcodes_threshold[i] > 2), transcode_sound_notifications_enabled === true, seeds >= aat_seed_threshold)
    if ((mp3_counter <= amount_transcodes_threshold || amount_transcodes_threshold > 2) && transcode_sound_notifications_enabled === true && seeds >= aat_seed_threshold) {
      audioplayer.src = settings["alert_amount_transcodes"]["sound"];
      audioplayer.volume = settings["alert_amount_transcodes"]["volume"];
      audioplayer.load();
      audioplayer.play();
    }
  //}

  for (var j = 0; j < transcode_desktop_notifications_triggers.length; j++) {
    if ((mp3_counter === parseInt(transcode_desktop_notifications_triggers[j]) || transcode_desktop_notifications_triggers[j] > 2) && transcode_desktop_notifications_enabled === true && seeds >= dnaat_seed_threshold) {
      notify("Found a torrent with " + mp3_counter + " transcodes", "AnimeBytes");
    }
  }
}

function notify_finish(torrent_amount, index) {
  var finish_sound_notifications_enabled = settings["alert_when_finished"]["enabled"];
  var finish_desktop_notifications_enabled = settings["desktop_notifications"]["alert_when_finished"]["enabled"];

  if (torrent_amount - 1 === index && finish_sound_notifications_enabled === true) {
    audioplayer.src = settings["alert_when_finished"]["sound"];
    audioplayer.volume = settings["alert_when_finished"]["volume"];
    audioplayer.load();
    audioplayer.play();
  }

  if (torrent_amount - 1 === index && finish_desktop_notifications_enabled === true) {
    notify("Finished searching the page", "AnimeBytes")
  }
}

function auto_opener(mp3_counter, url, seeds) {
  var auto_opener_enabled = settings["auto_opener"]["enabled"];
  var auto_opener_triggers = settings["auto_opener"]["triggers"];

  // ao = alert_amount_transcodes
  var ao_seed_threshold = settings["auto_opener"]["seeder_threshold"];

  var opened = false;

  for (var k = 0; k < auto_opener_triggers.length; k++) {
    if (mp3_counter === parseInt(auto_opener_triggers[k]) && auto_opener_enabled === true && opened === false && seeds >= ao_seed_threshold) {
      window.open(url, "_blank");
      opened = true;
    }
  }
}

function auto_downloader(mp3_counter, download_link, seeds) {
  var ads = settings["auto_downloader"];
  var ad_enabled = ads["enabled"];
  var ad_triggers = ads["triggers"];
  var ad_seeder_threshold = ads["seeder_threshold"]

  for (var i = 0; i < ad_triggers.length; i++) {
    console.log(ad_enabled === true && parseInt(ad_triggers[i]) === mp3_counter && seeds >= ad_seeder_threshold);
    console.log(ad_enabled, parseInt(ad_triggers[i]), mp3_counter, seeds, ad_seeder_threshold);
    if (ad_enabled === true && parseInt(ad_triggers[i]) === mp3_counter && seeds >= ad_seeder_threshold) {
      window.open(download_link);
    }
  }
}

function notify(body_text, title_text) {
  function spawnNotification(theBody,theIcon,theTitle) {
    var options = {
        body: theBody,
        icon: theIcon
    }

    var n = new Notification(theTitle,options);
  }

  spawnNotification(body_text, media["icons"]["notification_image"], title_text)
}

function create_settings_menu() {
  // This is the navigation element with links to all the numbered pages. Note: Top element, not bottom.
  var pages = document.getElementById("torrent_table");
  var pages_parent = pages.parentNode;

  var settings_menu_container = create_element("DIV");


  var settings_menu = "<h3>Alert at X amount of transcodes</h3>" +
      "<label> Enabled: <input id='transcode_amount_alert_enabled' type='checkbox' /> </label>" +
      "<br>" +
      "Amount: <input id='transcode_amount_alert_amount' type='text' /> " +
      "<br>" +
      "Amount of seeds threshold: <input id='transcode_amount_alert_seeder_threshold' type='text' /> " +
      "<br>" +
      "Volume: <input id='transcode_amount_alert_volume' type='text' />" +
      "<br>" +
      "Sound: <input id='transcode_amount_alert_sound_raw' type='text' />" +
      "<br>" +

      "<br>" +
      "<h3>Alert when finished</h3>" +
      "<label> Enabled: <input id='alert_when_finished_enabled' type='checkbox' /> </label>" +
      "<br>" +
      "Volume: <input id='alert_when_finished_volume' type='text' />" +
      "<br>" +
      "Sound: <input id='alert_when_finished_sound_raw' type='text' />" +
      "<br>" +

      "<br>" +
      "<h3>Auto opener</h3>" +
      "<label> Enabled: <input id='auto_opener_enabled' type='checkbox' /> </label>" +
      "<br>" +
      "Triggers: <input id='auto_opener_triggers' type='text' />" +
      "<br>" +
      '<span>Comma separated. Example: "0,1" (without quotes) will target torrent groups with 0 and 1 transcodes</span>' +
      "<br>" +
      "Amount of seeds threshold: <input id='auto_opener_seeder_threshold' type='text' />" +
      "<br>" +

      "<br>" +
      "<h3>Auto downloader</h3>" +
      "<label> Enabled: <input id='auto_downloader_enabled' type='checkbox' /> </label>" +
      "<br>" +
      "Triggers: <input id='auto_downloader_triggers' type='text' />" +
      "<br>" +
      '<span>Comma separated. Example: "0,1" (without quotes) will target torrent groups with 0 and 1 transcodes</span>' +
      "<br>" +
      "Amount of seeds threshold: <input id='auto_downloader_seeder_threshold' type='text' />" +
      "<br>" +

      "<br>" +
      "<h3>Desktop notifications</h3>" +
      "<h4>Notify at X amount transcodes</h4>" +
      "<label> Enabled: <input id='desktop_notifications_aat_enabled' type='checkbox' /> </label>" +
      "<br>" +
      "Triggers: <input id='desktop_notifications_aat_triggers' type='text' />" +
      "<br>" +
      '<span>Comma separated. Example: "0,1" (without quotes) will target torrent groups with 0 and 1 transcodes</span>' +
      "<br>" +
      "Amount of seeds threshold: <input id='desktop_notifications_aat_seeder_threshold' type='text' />" +
      "<br>" +

      "<h4>Notify when finished</h4>" +
      "<label> Enabled: <input id='desktop_notifications_awf_enabled' type='checkbox' /> </label>" +
      "<br>" +
      "<br>" +
      "<input id='save_settings' type='button' value='Save settings' />" +
      "<br>" +
      "<br>" +
      "<input id='scrape_button' type='button' value='Show transcodes' />";

  settings_menu_container.innerHTML = settings_menu;

  var br = create_element("BR");
  pages_parent.insertBefore(br, pages);
  pages_parent.insertBefore(settings_menu_container, pages);
}

function initialize_settings() {
  /*
    TRANSCODE AMOUNT ALERT
  */
  var taa = "transcode_amount_alert_";

  var taa_enabled = document.getElementById(taa + "enabled");
  var taa_amount = document.getElementById(taa + "amount");
  var taa_seeder_threshold = document.getElementById(taa + "seeder_threshold");
  var taa_volume = document.getElementById(taa + "volume");
  var taa_sound = document.getElementById(taa + "sound_raw");

  taa_enabled.checked = settings["alert_amount_transcodes"]["enabled"];
  taa_amount.value = settings["alert_amount_transcodes"]["amount"];

  if (settings["alert_amount_transcodes"]["seeder_threshold"] !== undefined) {
    taa_seeder_threshold.value = settings["alert_amount_transcodes"]["seeder_threshold"];
  } else {
    taa_seeder_threshold.value = 0;
  }

  taa_volume.value = settings["alert_amount_transcodes"]["volume"];
  taa_sound.value = settings["alert_amount_transcodes"]["sound_raw"];


  /*
    ALERT WHEN FINISHED
  */

  var awf = "alert_when_finished_";

  var awf_enabled = document.getElementById(awf + "enabled");
  var awf_volume = document.getElementById(awf + "volume");
  var awf_sound = document.getElementById(awf + "sound_raw");

  var awfs = settings["alert_when_finished"];

  awf_enabled.checked = awfs["enabled"];
  awf_volume.value = awfs["volume"];
  awf_sound.value = awfs["sound_raw"];




  /*
    AUTO OPENER
  */

  var ao = "auto_opener_";

  var ao_enabled = document.getElementById(ao + "enabled");
  var ao_triggers = document.getElementById(ao + "triggers")
  var ao_seeder_threshold = document.getElementById(ao + "seeder_threshold");

  var aos = settings["auto_opener"];

  ao_enabled.checked = aos["enabled"];
  ao_triggers.value = aos["triggers"];

  if (aos["seeder_threshold"] !== undefined) {
    ao_seeder_threshold.value = aos["seeder_threshold"];
  } else {
    ao_seeder_threshold.value = 0;
  }




  /*
    AUTO DOWNLOADER
  */


  var autod = "auto_downloader_";

  var autod_enabled = document.getElementById(autod + "enabled");
  var autod_triggers = document.getElementById(autod + "triggers");
  var autod_seeder_threshold = document.getElementById(autod + "seeder_threshold");

  var autods = settings["auto_downloader"];

  if (autods !== undefined) {
    autod_enabled.checked = autods["enabled"];
    autod_triggers.value = autods["triggers"];
    autod_seeder_threshold.value = autods["seeder_threshold"];
  } else {
    autod_enabled.checked = false;
    autod_triggers.value = "0";
    autod_seeder_threshold.value = 0;

    settings["auto_downloader"] = def_settings["auto_download"];
  }

  /*
  if (autods !== undefined) {
    autod_enabled.checked = autods["enabled"];
  } else {
    autod_enabled.checked = false;
  }

  if (autods !== undefined) {
    autod_triggers.value = autods["triggers"];
  } else {
    autod_triggers.value = "0";
  }

  if (autods !== undefined) {
    autod_seeder_threshold.value = autods["seeder_threshold"];
  } else {
    autod_seeder_threshold.value = 0;
  }
  */



  /*
    DESKTOP NOTIFICATIONS
  */

  // AAT
  var dnaat = "desktop_notifications_aat_";

  var dnaat_enabled = document.getElementById(dnaat + "enabled");
  var dnaat_triggers = document.getElementById(dnaat + "triggers");
  var dnaat_seeder_threshold = document.getElementById(dnaat + "seeder_threshold");

  var dnaats = settings["desktop_notifications"]["alert_amount_transcodes"];

  dnaat_enabled.checked = dnaats["enabled"];
  dnaat_triggers.value = dnaats["triggers"];

  if (dnaats["seeder_threshold"] !== undefined) {
    dnaat_seeder_threshold.value = dnaats["seeder_threshold"];
  } else {
    dnaat_seeder_threshold.value = 0;
  }

  // AWF

  var dnawf = "desktop_notifications_awf_";

  var dnawf_enabled = document.getElementById(dnawf + "enabled");

  var dnawfs = settings["desktop_notifications"]["alert_when_finished"];

  dnawf_enabled.checked = dnawfs["enabled"];

  save_settings();
}

function save_settings() {
  var taa = "transcode_amount_alert_";

  var taa_enabled = document.getElementById(taa + "enabled");
  var taa_amount = document.getElementById(taa + "amount");
  var taa_seeder_threshold = document.getElementById(taa + "seeder_threshold");
  var taa_volume = document.getElementById(taa + "volume");
  var taa_sound_raw = document.getElementById(taa + "sound_raw");

  var taas = settings["alert_amount_transcodes"];

  var awf = "alert_when_finished_";

  var awf_enabled = document.getElementById(awf + "enabled");
  var awf_volume = document.getElementById(awf + "volume");
  var awf_sound_raw = document.getElementById(awf + "sound_raw");

  var awfs = settings["alert_when_finished"];

  /*
    AUTO OPENER
  */

  var ao = "auto_opener_";

  var ao_enabled = document.getElementById(ao + "enabled");
  var ao_triggers = document.getElementById(ao + "triggers")
  var ao_seeder_threshold = document.getElementById(ao + "seeder_threshold");

  var aos = settings["auto_opener"];


  /*
    AUTO DOWNLOADER
  */

  var autod = "auto_downloader_";

  var autod_enabled = document.getElementById(autod + "enabled");
  var autod_triggers = document.getElementById(autod + "triggers");
  var autod_seeder_threshold = document.getElementById(autod + "seeder_threshold");

  var autods = settings["auto_downloader"];


  /*
    DESKTOP NOTIFICATIONS
  */

  // AAT
  var dnaat = "desktop_notifications_aat_";

  var dnaat_enabled = document.getElementById(dnaat + "enabled");
  var dnaat_triggers = document.getElementById(dnaat + "triggers");
  var dnaat_seeder_threshold = document.getElementById(dnaat + "seeder_threshold");

  var dnaats = settings["desktop_notifications"]["alert_amount_transcodes"];

  // AWF

  var dnawf = "desktop_notifications_awf_";

  var dnawf_enabled = document.getElementById(dnawf + "enabled");

  var dnawfs = settings["desktop_notifications"]["alert_when_finished"];


  taas["enabled"] = taa_enabled.checked;
  taas["amount"] = parseFloat(taa_amount.value);
  taas["volume"] = parseFloat(taa_volume.value);
  taas["seeder_threshold"] = parseInt(taa_seeder_threshold.value);
  taas["sound"] = get_sound(taa_sound_raw.value);
  taas["sound_raw"] = taa_sound_raw.value;

  awfs["enabled"] = awf_enabled.checked;
  awfs["volume"] = parseFloat(awf_volume.value);
  awfs["sound"] = get_sound(awf_sound_raw.value);
  awfs["sound_raw"] = awf_sound_raw.value;

  aos["enabled"] = ao_enabled.checked;
  aos["triggers"] = ao_triggers.value.split(",");
  aos["seeder_threshold"] = parseInt(ao_seeder_threshold.value);

  autods["enabled"] = autod_enabled.checked;
  autods["triggers"] = autod_triggers.value.split(",");
  autods["seeder_threshold"] = parseInt(autod_seeder_threshold.value);

  dnaats["enabled"] = dnaat_enabled.checked;
  dnaats["triggers"] = dnaat_triggers.value.split(",");
  dnaats["seeder_threshold"] = parseInt(dnaat_seeder_threshold.value);

  dnawfs["enabled"] = dnawf_enabled.checked;

  save("userscript_transcode_lister_settings", settings);

  if (settings["version"] !== load("userscript_transcode_lister_settings")["version"]) {
    window.location.reload();
  }
}

function create_element(elem) {
  // Might be a redundant function
  var element = document.createElement(elem);

  return element;
}

clickable.addEventListener("click", scrape, true);

/*
var settings = {
  "alert_amount_transcodes": {
    "enabled": false,
    "amount": [0],
    "volume": 0.5,
    "sound": get_sound("tuturu")
  },
  "alert_when_finished": {
    "enabled": false,
    "volume": 0.5,
    "sound": get_sound("ohmygah")
  },
  "auto_opener": {
    "enabled": false,
    "triggers": [0]
  },
  "desktop_notifications": {
    "alert_amount_transcodes": {
      "enabled": true,
      "triggers": [0]
    },
    "alert_when_finished": {
     "enabled": true
    }
  }
}
*/

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key) {
  return JSON.parse(localStorage.getItem(key));
}

function load_settings() {
  if (load("userscript_transcode_lister_settings") === undefined || load("userscript_transcode_lister_settings") === null) {
    save("userscript_transcode_lister_settings", settings);
    console.log("saved");
  } else {
    settings = load("userscript_transcode_lister_settings");
    console.log("loaded");
  }
}










