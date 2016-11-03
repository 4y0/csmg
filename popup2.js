var cache_snippets = [];

function getCodeSnippets(callback){
	chrome.storage.local.get(['snippets','last_run_index'], function(store){

		if(!store['snippets']){
			store['snippets'] = [];
			chrome.storage.local.set({'snippets':store['snippets']});
		}

		callback(store['snippets'], store['last_run_index']);
	});
}

function deleteCodeSnippet(index){
	getCodeSnippets( function(snippets){
		if(typeof index != 'undefined' && index != ''){
			snippets.splice(index, 1);
			chrome.storage.local.set({'snippets':snippets});
			doGetSnippets(0);
			displaySnippet('abc');
		}
	})
}


function saveCodeSnippet(snippet, callback, optional_snippet_index){
	getCodeSnippets( function(snippets){
		if(typeof optional_snippet_index == 'undefined' || optional_snippet_index == ""){
			snippets.push(snippet);
			optional_snippet_index = snippets.length - 1;
		}
		else
			snippets[optional_snippet_index] = snippet;

		chrome.storage.local.set({'snippets':snippets}, function(){ callback(optional_snippet_index); });
	});
}

function renderSnippets(container, snippets) {
	$(container).html('');
	$(container).append( '<option value="'+""+'">' + " new snippet " + '</option>' );
	snippets.forEach(  function(s, i){
		$(container).append( '<option value="'+i+'">' + s.title + '</option>' );
	});
}

function displaySnippet(snippet_index){
	var snippet = cache_snippets[snippet_index];

	if(snippet){
		$('#code').html(snippet.code);
		$('#code').val(snippet.code);
		$('#snippet_title').val(snippet.title);
		$('#snippet_index').val(snippet_index);
	}
	else{
		$('#code').html("");
		$('#code').val("");
		$('#snippet_title').val("");
		$('#snippet_index').val("");
	}
	
}

function doGetSnippets(is_init){
	getCodeSnippets(  function(snippets, last_run_index){
		//alert(snippets.length);
		cache_snippets = snippets;
		renderSnippets('#snippets', snippets);
		if(typeof is_init != 'undefined' && is_init != ''){ 
			displaySnippet(is_init);
			$("#snippets").val(is_init);
		}
		else if(typeof last_run_index != 'undefined' && last_run_index != ''){
			displaySnippet(last_run_index);
			$("#snippets").val(last_run_index);
		}
	});
}


function saveLastRunIndex(index){

	if(typeof index != 'undefined' && index != '')
	{
		chrome.storage.local.set({'last_run_index':index});
	}
}


$(document).ready( function (e){

	doGetSnippets();

	$(".run-script").click(  function(e){
		chrome.tabs.query({active:true}, function (tabs){
			
			if (tabs && tabs.length){
				var tab  = tabs[0];
				var code = $('#code').val(); 
				if(code && code != "")
				{
					chrome.tabs.executeScript(tab.id, {code:code});
					saveLastRunIndex( $("#snippet_index").val() );
				}
			}

		});
	});


	$("#snippets").change(  function(e){ 
		if(cache_snippets && cache_snippets.length){
			displaySnippet($(this).val());
			//var snippet = cache_snippets[$(this).val()];
			//$('#code').html(snippet.code);
			//$('#snippet_title').val(snippet.title);
		}
	});

	$(".delete").click( function(e){

		//var codeSnippets = [];
		var snippet_index = $("#snippet_index").val();  
		if(snippet_index != ""){

			deleteCodeSnippet(snippet_index);	
		}
		


	});

	$(".save").click( function(e){

		//var codeSnippets = [];
		var snippet_index = $("#snippet_index").val();
		var code = $('#code').val(); 
		var snippet_title = $('#snippet_title').val() || 'Untitled - ' + new Date().toString();
		if(code && code != ""){

			saveCodeSnippet({code:code,title:snippet_title}, doGetSnippets, snippet_index);	
		}
		


	});


});