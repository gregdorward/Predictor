(this.webpackJsonppredictor=this.webpackJsonppredictor||[]).push([[0],{32:function(e,a,t){},40:function(e,a,t){"use strict";t.r(a);var s=t(1),r=t(0),n=t.n(r),o=t(3),c=t.n(o),i=(t(32),t(2)),l=t.n(i),d=t(4);var u=function(){return Object(s.jsx)("div",{children:Object(s.jsx)("h1",{children:"Predictor"})})},p=t(8),m=t(9),g=t(11),h=t(10),f="5",x=function(e){Object(g.a)(t,e);var a=Object(h.a)(t);function t(e){var s;return Object(p.a)(this,t),(s=a.call(this,e)).handleOptionChange=function(){s.setState({selectedOption:s.props.value}),f=s.state.selectedOption},s.state={selectedOption:s.props.value},s}return Object(m.a)(t,[{key:"render",value:function(){return Object(s.jsx)("section",{className:"dark",children:Object(s.jsx)("div",{className:this.props.className,children:Object(s.jsxs)("label",{children:[Object(s.jsx)("input",{type:"radio",name:"lastGames",checked:this.state.checked,onChange:this.handleOptionChange}),Object(s.jsx)("span",{className:"design"}),Object(s.jsxs)("span",{className:"text",children:["Last ",this.props.value," games"]})]})})})}}]),t}(r.Component);function v(e){return Object(s.jsx)("div",{id:"Button",children:Object(s.jsx)("button",{variant:"primary",type:"button",onClick:e.onClickEvent,children:e.text})})}var b=t(20),j=t(7);function O(e){return y.apply(this,arguments)}function y(){return(y=Object(d.a)(l.a.mark((function e(a){var t;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:e.t0=!0,e.next=e.t0===a<.49?3:e.t0===(a>=.5&&a<=1)?5:e.t0===(a>=1.01&&a<=1.25)?7:e.t0===(a>=1.26&&a<=1.5)?9:e.t0===(a>=1.51&&a<=2)?11:e.t0===(a>=2.01&&a<=2.5)?13:e.t0===(a>=2.51&&a<=3)?15:17;break;case 3:return t="#CD5C5C",e.abrupt("break",19);case 5:return t="#F08080",e.abrupt("break",19);case 7:return t="#FFA07A",e.abrupt("break",19);case 9:return t="#FFFFE0",e.abrupt("break",19);case 11:return t="#CFDBC5",e.abrupt("break",19);case 13:return t="#8AA37B",e.abrupt("break",19);case 15:return t="#3F6826",e.abrupt("break",19);case 17:return t="white",e.abrupt("break",19);case 19:return e.abrupt("return",t);case 20:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function F(e){return w.apply(this,arguments)}function w(){return(w=Object(d.a)(l.a.mark((function e(a){var t,s,r,n;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=[a.homeId,a.awayId],s=[],r=l.a.mark((function e(a){var r,n;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=t[a],e.next=3,fetch(Se+"https://api.footystats.org/lastx?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&team_id=")+r);case 3:return n=e.sent,e.next=6,n.json().then((function(e){s[a]=e}));case 6:case"end":return e.stop()}}),e)})),n=0;case 4:if(!(n<t.length)){e.next=9;break}return e.delegateYield(r(n),"t0",6);case 6:n++,e.next=4;break;case 9:return e.abrupt("return",s);case 10:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function A(e){return Object(s.jsx)("img",{src:"https://cdn.footystats.org/img/".concat(e.image),className:e.ClassName,alt:e.alt,"flex-shrink":e.flexShrink})}var k=t(21),_=t.n(k),T=function(e){Object(g.a)(t,e);var a=Object(h.a)(t);function t(){var e;Object(p.a)(this,t);for(var s=arguments.length,r=new Array(s),n=0;n<s;n++)r[n]=arguments[n];return(e=a.call.apply(a,[this].concat(r))).state={isOpen:!1},e.handleOnClick=function(){e.setState((function(e){return{isOpen:!e.isOpen}}))},e}return Object(m.a)(t,[{key:"render",value:function(){return Object(s.jsxs)("div",{style:{fontFamily:"sans-serif"},children:[Object(s.jsx)("button",{onClick:this.handleOnClick,children:this.props.buttonText}),this.state.isOpen&&Object(s.jsx)(_.a,{className:"Collapsable",children:this.props.text})]})}}]),t}(r.Component);var S=function(e){return Object(s.jsxs)("ul",{className:e.className,children:[Object(s.jsx)("li",{children:"Team name - ".concat(e.name)},e.name),Object(s.jsx)("li",{className:"TeamScored",children:"Average goals scored - ".concat(e.goals)},"TeamScored"),Object(s.jsx)("li",{className:"TeamConceeded",children:"Average goals conceeded - ".concat(e.conceeded)},"TeamConceeded"),Object(s.jsx)("li",{className:"TeamPossession",children:"Average possession - ".concat(e.possession,"%")},"TeamPossession"),Object(s.jsx)("li",{className:"TeamXG",children:"Average XG - ".concat(e.XG)},"TeamXG"),Object(s.jsx)("li",{className:"AverageSOT",children:"Average shots on target - ".concat(e.sot)},"AverageSOT"),Object(s.jsx)("li",{className:"DangerousAttacks",children:"Average dangerous attacks - ".concat(e.dangerousAttacks)},"DangerousAttacks")]})};var C,G=function(e){return Object(s.jsx)("div",{className:e.className,children:e.text})};function N(){return(N=Object(d.a)(l.a.mark((function e(a){var t,r,n,o,i,d,u,p,m;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:5===(t=parseInt(f))?(r=0,n=5):6===t?(r=1,n=6):10===t&&(r=2,n=10),console.log(Oe),o=Oe.find((function(e){return e.id===a.id})),i=o.home.teamName,d=o.away.teamName,u=a.time,[].push({btts:a.btts_potential}),(p=[]).push({name:a.homeTeam,AverageGoals:(o.home[r].ScoredOverall/n).toFixed(2),AverageConceeded:(o.home[r].ConcededOverall/n).toFixed(2),AverageXG:o.home[r].XG,AveragePossession:o.home[r].AveragePossession,AverageShotsOnTarget:o.home[r].AverageShotsOnTarget,AverageDangerousAttacks:o.home[r].AverageDangerousAttacks,homeOrAway:"Home"}),(m=[]).push({name:a.awayTeam,AverageGoals:(o.away[r].ScoredOverall/n).toFixed(2),AverageConceeded:(o.away[r].ConcededOverall/n).toFixed(2),AverageXG:o.away[r].XG,AveragePossession:o.away[r].AveragePossession,AverageShotsOnTarget:o.away[r].AverageShotsOnTarget,AverageDangerousAttacks:o.away[r].AverageDangerousAttacks,homeOrAway:"Away"}),c.a.render(Object(s.jsx)(G,{className:"MatchTime",text:"Kick off: "+u}),document.getElementById("stats"+i)),c.a.render(Object(s.jsx)(G,{className:"BTTSPotential",text:"BTTS Potential: "+a.btts_potential+"%"}),document.getElementById("BTTSPotential"+a.id)),c.a.render(Object(s.jsx)(S,{className:p[0].homeOrAway,name:p[0].name,goals:p[0].AverageGoals,conceeded:p[0].AverageConceeded,XG:p[0].AverageXG,possession:p[0].AveragePossession,sot:p[0].AverageShotsOnTarget,dangerousAttacks:p[0].AverageDangerousAttacks},p[0].name),document.getElementById("home"+i)),c.a.render(Object(s.jsx)(S,{className:m[0].homeOrAway,name:m[0].name,goals:m[0].AverageGoals,conceeded:m[0].AverageConceeded,XG:m[0].AverageXG,possession:m[0].AveragePossession,sot:m[0].AverageShotsOnTarget,dangerousAttacks:m[0].AverageDangerousAttacks},m[0].name),document.getElementById("away"+d));case 17:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function P(e){var a,t,n=e.status,o=C;if(!1===o&&"complete"!==n)return Object(s.jsx)("div",{className:"divider",children:"V"});if(!1===o&&"complete"===n)return Object(s.jsx)("div",{className:"Result",children:"".concat(e.fixture.homeGoals," - ").concat(e.fixture.awayGoals)});if(!0!==o||"complete"!==n)return Object(s.jsx)("div",{className:"score",children:"".concat(e.fixture.goalsA," - ").concat(e.fixture.goalsB)},e.fixture.id);switch(!0){case e.fixture.homeGoals>e.fixture.awayGoals:a=0,e.fixture.winner=e.fixture.homeTeam;break;case e.fixture.homeGoals===e.fixture.awayGoals:a=1,e.fixture.winner="draw";break;case e.fixture.homeGoals<e.fixture.awayGoals:a=2,e.fixture.winner=e.fixture.awayTeam}switch(!0){case e.fixture.goalsA>e.fixture.goalsB:t=0;break;case e.fixture.goalsA===e.fixture.goalsB:t=1;break;case e.fixture.goalsA<e.fixture.goalsB:t=2}if(a===t){switch(!0){case 0===a:e.fixture.profit=e.fixture.homeOdds;break;case 1===a:e.fixture.profit=e.fixture.drawOdds;break;case 2===a:e.fixture.profit=e.fixture.awayOdds}return Object(s.jsxs)(r.Fragment,{children:[Object(s.jsx)("div",{className:"CorrectResult",children:"".concat(e.fixture.homeGoals," - ").concat(e.fixture.awayGoals)}),Object(s.jsx)("div",{className:"score",children:"".concat(e.fixture.goalsA," - ").concat(e.fixture.goalsB)},e.fixture.homeTeam)]})}return a!==t?(e.fixture.profit=-1,Object(s.jsxs)(r.Fragment,{children:[Object(s.jsx)("div",{className:"Result",children:"".concat(e.fixture.homeGoals," - ").concat(e.fixture.awayGoals)}),Object(s.jsx)("div",{className:"score",children:"".concat(e.fixture.goalsA," - ").concat(e.fixture.goalsB)},e.fixture.awayTeam)]})):void 0}var B=function(e){var a=e.fixture;return Object(s.jsxs)("div",{children:[Object(s.jsxs)("li",{className:"individualFixture",onClick:function(){return function(e){return N.apply(this,arguments)}(a)},children:[Object(s.jsx)("div",{className:"homeForm",style:{backgroundColor:a.homeFormColour},children:a.homePpg}),Object(s.jsx)("div",{className:"homeTeam",children:a.homeTeam}),Object(s.jsx)(P,{result:C,status:a.status,fixture:a}),Object(s.jsx)("div",{className:"awayTeam",children:a.awayTeam}),Object(s.jsx)("div",{className:"awayForm",style:{backgroundColor:a.awayFormColour},children:a.awayPpg}),Object(s.jsx)(A,{image:a.homeBadge,ClassName:"HomeBadge",alt:"Home team badge",flexShrink:5}),Object(s.jsx)(A,{image:a.awayBadge,ClassName:"AwayBadge",alt:"Away team badge"})]},a.id),Object(s.jsxs)("div",{children:[Object(s.jsx)("div",{id:"stats"+a.homeTeam}),Object(s.jsxs)(r.Fragment,{children:[Object(s.jsx)("div",{id:"BTTSPotential"+a.id}),Object(s.jsxs)("div",{className:"StatsContainer",children:[Object(s.jsx)("div",{className:"HomeStats",id:"home"+a.homeTeam}),Object(s.jsx)("div",{className:"AwayStats",id:"away"+a.awayTeam})]})]})]})]})},X="Next to each badge is each team\u2019s points per game picked up at home or away.\n Once the fixtures have loaded, click on \u201cGet Predictions\u201d to get predictions based on form data.\n Click on an individual fixture for detailed stats for both teams.\n If you change your form selection, re-tapping the fixture will fetch new form data.\n You can also fetch fresh predictions based on the newly selected option by re-tapping on \u201cGet Predictions\u201d at any time.\n If a match is resulted, tapping \u201cGet Predictions\u201d will show how accurate the prediction was.\n If no form radio button is chosen, the last 5 games will be used by default".split("\n").map((function(e){return Object(s.jsx)("p",{children:e})})),D=function(e){var a=e.fixtures;return Object(s.jsxs)("div",{children:[Object(s.jsx)(r.Fragment,{children:Object(s.jsx)(T,{buttonText:"How do I use this?",text:X})}),Object(s.jsx)("ul",{children:a.map((function(e,a){return Object(s.jsx)(B,{fixture:e})}))})]})};function I(e){return C=e.result,Object(s.jsx)(D,{fixtures:e.fixtures,result:C})}var R=new Headers;R.append("Origin","https://gregdorward.github.io");function E(e,a,t,s){return V.apply(this,arguments)}function V(){return(V=Object(d.a)(l.a.mark((function e(a,t,s,r){var n,o,c,i,d,u,p,m,g,h,f,x,v,b,j,O,y,F,w,A,k,_,T;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log("allForm"),console.log(typeof Oe),console.log(Oe),console.log(Oe.find((function(e){return e.id===r})).home),c=[Oe.find((function(e){return e.id===r})).home,Oe.find((function(e){return e.id===r})).away],i=0;case 6:if(!(i<c.length)){e.next=40;break}0!==parseFloat(c[i][t].ScoredOverall)?c[i][t].finishingScore=parseFloat((c[i][t].ScoredOverall/s/c[i][t].XG).toFixed(2)):c[i][t].finishingScore=0,0!==parseFloat(c[i][t].ConcededOverall)?c[i][t].goalieRating=parseFloat((c[i][t].XGAgainstAvg/(c[i][t].ConcededOverall/s)).toFixed(2)):c[i].goalieRating=0,c[i][t].defenceScore=parseInt(c[i][t].CleanSheetPercentage),void 0,d=c[i][t].defenceScore,e.t0=!0,e.next=e.t0===d<20?15:e.t0===(d>=20&&d<40)?17:e.t0===(d>=40&&d<60)?19:e.t0===(d>=60&&d<80)?21:e.t0===d>=80?23:25;break;case 15:return c[i][t].defenceRating=0,e.abrupt("break",26);case 17:return c[i][t].defenceRating=.3,e.abrupt("break",26);case 19:return c[i][t].defenceRating=.7,e.abrupt("break",26);case 21:return c[i][t].defenceRating=1.1,e.abrupt("break",26);case 23:return c[i][t].defenceRating=1.5,e.abrupt("break",26);case 25:return e.abrupt("break",26);case 26:return e.t1=parseFloat,e.next=29,be(c[i][t].finishingScore,1);case 29:return e.t2=e.sent,c[i][t].finalFinishingScore=(0,e.t1)(e.t2),e.t3=parseFloat,e.next=34,be(c[i][t].goalieRating,1);case 34:e.t4=e.sent,c[i][t].finalGoalieRating=(0,e.t3)(e.t4),c[i][t].forecastedXG=parseFloat(c[i][t].XG+parseFloat(c[i][t].finalFinishingScore));case 37:i++,e.next=6;break;case 40:return 0===a.homeOdds.toFixed(1)&&0===a.awayOdds.toFixed(1)?(n=0,o=0):(n=(1/a.homeOdds).toFixed(2),o=(1/a.awayOdds).toFixed(2)),u=c[0][t],p=c[1][t],m=u.finalGoalieRating,g=(u.defenceScore+m)/2,h=p.finalGoalieRating,f=(p.defenceScore+h)/2,x=parseFloat(n),v=parseFloat(o),e.next=51,be(x,v);case 51:return e.t5=e.sent,b=(2*e.t5).toFixed(2),e.next=55,be(v,x);case 55:return e.t6=e.sent,j=(2*e.t6).toFixed(2),O=parseFloat(u.XGAgainstAvg),y=parseFloat(p.XGAgainstAvg),F=f>0?parseFloat(b-f/10+.5)+y:parseFloat(b+f/10+.5)+y,w=g>0?parseFloat(j-g/10+.5)+O:parseFloat(j+g/10+.5)+O,A=Math.round(parseFloat(u.XG)+F),k=Math.round(parseFloat(p.XG)+w),A<0&&(A=0),k<0&&(k=0),_=Math.round(parseFloat(3*A+u.ScoredOverall/s+u.forecastedXG+p.ConcededOverall/s)/6),T=Math.round(parseFloat(3*k+p.ScoredOverall/s+p.forecastedXG+u.ConcededOverall/s)/6),a.homePrediction=_,a.awayPrediction=T,"suspended"===a.status&&(_="P",T="P"),e.abrupt("return",[_,T]);case 71:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function L(e){for(var a=-1,t=-1,n=0,o=0;o<e.length;o++)if(e[o].profit){var i=parseFloat(e[o].profit);t=(a=parseFloat(a+i)).toFixed(2),n+=1}else t=(a=parseFloat(a+0)).toFixed(2);n>0&&c.a.render(Object(s.jsx)(r.Fragment,{children:Object(s.jsx)(G,{className:"SuccessMeasure",text:"accumulated profit/loss if \xa31 was staked on each of the  ".concat(n," games: \xa3").concat(t)})}),document.getElementById("successMeasure"))}var M,H,Y=[],J=1,U=[];function W(e){return K.apply(this,arguments)}function K(){return(K=Object(d.a)(l.a.mark((function e(a){var t,n,o,i,u,p;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=parseInt(f),Y=[],J=1,5===t?(n=0,o=5):6===t?(n=1,o=6):10===t&&(n=2,o=10),i=[],e.next=7,fetch("".concat("https://pacific-depths-00420.herokuapp.com/").concat(a,"Predictions").concat(o),{method:"GET",headers:{Accept:"application/json"}});case 7:if(u=e.sent,U=[],200!==u.status){e.next=12;break}return e.next=12,u.json().then((function(e){console.log("these are the predictions"),console.log(e),i=e.fixtures.predictions}));case 12:return 0,p=!1,e.next=16,Promise.all(Q.map(function(){var e=Object(d.a)(l.a.mark((function e(a){var t,d,u,m,g,h,f,x;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=i.find((function(e){return e.id===a.id})),console.log(t),console.log(i),!t){e.next=39;break}e.t0=!0,e.next=e.t0===("complete"===a.status)?7:e.t0===("incomplete"===a.status)?12:e.t0===("suspended"===a.status)?22:27;break;case 7:return console.log(t.game),a.goalsA=t.goalsA,a.goalsB=t.goalsB,console.log("fetching stored prediction - complete"),e.abrupt("break",37);case 12:return e.next=14,E(a,n,o,a.id);case 14:return d=e.sent,u=Object(j.a)(d,2),a.goalsA=u[0],a.goalsB=u[1],p=!0,console.log(a.game),console.log("fetching new prediction - incomplete"),e.abrupt("break",37);case 22:return a.goalsA="P",a.goalsB="P",console.log(a.game),console.log("game postponed"),e.abrupt("break",37);case 27:return e.next=29,E(a,n,o,a.id);case 29:return m=e.sent,g=Object(j.a)(m,2),a.goalsA=g[0],a.goalsB=g[1],p=!0,console.log(a.game),console.log("default - fetching stored prediction"),e.abrupt("break",37);case 37:e.next=48;break;case 39:return e.next=41,E(a,n,o,a.id);case 41:h=e.sent,f=Object(j.a)(h,2),a.goalsA=f[0],a.goalsB=f[1],p=!0,console.log(a.game),console.log("else clause triggered");case 48:a.predictionOutcome="unknown",a.goalsA-1>a.goalsB&&0!==a.homeOdds?("complete"===a.status&&a.homeTeam===a.winner?a.predictionOutcome="Won":"complete"===a.status&&a.homeTeam!==a.winner&&(a.predictionOutcome="Lost"),J=parseFloat(J)*parseFloat(a.homeOdds),x={team:a.homeTeam,odds:a.homeOdds,outcome:a.predictionOutcome},Y.push(x)):a.goalsB-1>a.goalsA&&0!==a.awayOdds&&("complete"===a.status&&a.awayTeam===a.winner?a.predictionOutcome="Won":"complete"===a.status&&a.awayTeam!==a.winner&&(a.predictionOutcome="Lost"),J=parseFloat(J)*parseFloat(a.awayOdds),x={team:a.awayTeam,odds:a.awayOdds,outcome:a.predictionOutcome},Y.push(x)),c.a.render(Object(s.jsx)(I,{fixtures:Q,result:!0,className:"individualFixture"}),document.getElementById("FixtureContainer")),Y.length>0&&c.a.render(Object(s.jsx)("div",{children:Object(s.jsx)(r.Fragment,{children:Object(s.jsx)(T,{buttonText:"Predictions of the day",text:Object(s.jsxs)("ul",{className:"BestPredictions",children:[Object(s.jsx)("lh",{children:"To win"}),Y.map((function(e){return Object(s.jsxs)("li",{className:e.outcome,children:[e.team," odds: ",e.odds]},e.team)})),Object(s.jsx)("div",{className:"AccumulatedOdds",children:"Accumulator odds: ".concat(J.toFixed(2)," / 1")})]})})})}),document.getElementById("bestPredictions")),console.log(a),U.push(a),console.log("pushed"),console.log("current state of predictions..."),console.log("TYPE"),console.log(typeof U),console.log(U),1;case 60:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}()));case 16:return console.log("Node env"),console.log("production"),!0===p&&"yesterdaysFixtures"!==a&&q(U,o,a),e.next=21,L(Q);case 21:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function q(e,a,t){return z.apply(this,arguments)}function z(){return(z=Object(d.a)(l.a.mark((function e(a,t,s){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("".concat("https://pacific-depths-00420.herokuapp.com/","postPredictions").concat(t).concat(s),{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({predictions:a})});case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}t(18).config(),console.log("https://pacific-depths-00420.herokuapp.com/");var Q=[],Z=[],$=(new Date).toLocaleDateString("en-US").split("/"),ee=Object(j.a)($,3),ae=ee[0],te=ee[1],se=ee[2],re=new Date;re.setDate((new Date).getDate()+1);var ne=re.toLocaleDateString("en-US").split("/"),oe=Object(j.a)(ne,3),ce=oe[0],ie=oe[1],le=oe[2],de=new Date;de.setDate((new Date).getDate()-1);var ue=de.toLocaleDateString("en-US").split("/"),pe=Object(j.a)(ue,3),me=pe[0],ge=pe[1],he=pe[2],fe="https://api.footystats.org/todays-matches?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&date=").concat(he,"-").concat(me,"-").concat(ge),xe="https://api.footystats.org/todays-matches?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&date=").concat(se,"-").concat(ae,"-").concat(te),ve="https://api.footystats.org/todays-matches?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&date=").concat(le,"-").concat(ce,"-").concat(ie);function be(e,a){return je.apply(this,arguments)}function je(){return(je=Object(d.a)(l.a.mark((function e(a,t){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",parseFloat(a-t).toFixed(2));case 1:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var Oe=[];function ye(e,a){return Fe.apply(this,arguments)}function Fe(){return(Fe=Object(d.a)(l.a.mark((function e(a,t){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a.game=a.homeTeam+" v "+a.awayTeam,c.a.render(Object(s.jsx)(I,{fixtures:Q,result:t,className:"individualFixture"}),document.getElementById("FixtureContainer"));case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var we=new Headers;we.append("Origin","https://gregdorward.github.io");function Ae(e,a){return ke.apply(this,arguments)}function ke(){return(ke=Object(d.a)(l.a.mark((function e(a,t){var r,n,o,i,d,u,p,m;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:5===(r=parseInt(t))?0:6===r?1:10===r&&2,e.t0=a,e.next="yesterdaysFixtures"===e.t0?5:"todaysFixtures"===e.t0?7:"tomorrowsFixtures"===e.t0?9:11;break;case 5:return n=fe,e.abrupt("break",12);case 7:return n=xe,e.abrupt("break",12);case 9:return n=ve,e.abrupt("break",12);case 11:return e.abrupt("break",12);case 12:return e.next=14,fetch(Se+n);case 14:return M=e.sent,e.next=17,M.json().then((function(e){H=Array.from(e.data)}));case 17:return c.a.render(Object(s.jsx)(v,{text:"Get Predictions",onClickEvent:function(){return W(a)}}),document.getElementById("Buttons")),e.next=20,fetch("".concat("https://pacific-depths-00420.herokuapp.com/","form").concat(a),{method:"GET",headers:{Accept:"application/json"}});case 20:if(200!==(u=e.sent).status){e.next=26;break}return e.next=24,u.json().then((function(e){i=Array.from(e.form.allForm),d=!0,Oe=i}));case 24:e.next=28;break;case 26:console.log("Stored form not fetched"),d=!1;case 28:p=l.a.mark((function e(a){var t,s,r,n,c,i;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:Z=H.filter((function(e){return e.competition_id===Ne[a].element.id})),t=Object(b.a)(Z),e.prev=2,t.s();case 4:if((s=t.n()).done){e.next=49;break}if(r=s.value,n=r.date_unix,c=new Date(1e3*n),(i={}).id=r.id,i.competition_id=r.competition_id,i.time=c.toLocaleString("en-US",{hour:"numeric"}),i.homeTeam=r.home_name,i.awayTeam=r.away_name,i.homeOdds=r.odds_ft_1,i.awayOdds=r.odds_ft_2,i.drawOdds=r.odds_ft_x,i.homeId=r.homeID,i.awayId=r.awayID,i.form=[],i.homeTeamInfo=[],i.awayTeamInfo=[],d){e.next=29;break}return e.next=26,F(i);case 26:o=e.sent,console.log("Pusing match to form object"),Oe.push({id:i.id,home:{teamName:i.homeTeam,0:{XG:parseFloat(o[0].data[0].stats.xg_for_avg_overall),ScoredOverall:parseFloat(o[0].data[0].stats.seasonScoredNum_overall),ConcededOverall:parseFloat(o[0].data[0].stats.seasonConcededNum_overall),XGAgainstAvg:parseFloat(o[0].data[0].stats.xg_against_avg_overall),CleanSheetPercentage:parseFloat(o[0].data[0].stats.seasonCSPercentage_overall),AveragePossession:parseFloat(o[0].data[0].stats.possessionAVG_overall),AverageShotsOnTarget:parseFloat(o[0].data[0].stats.shotsOnTargetAVG_overall),AverageDangerousAttacks:parseFloat(o[0].data[0].stats.dangerous_attacks_avg_overall)},1:{XG:parseFloat(o[0].data[1].stats.xg_for_avg_overall),ScoredOverall:parseFloat(o[0].data[1].stats.seasonScoredNum_overall),ConcededOverall:parseFloat(o[0].data[1].stats.seasonConcededNum_overall),XGAgainstAvg:parseFloat(o[0].data[1].stats.xg_against_avg_overall),CleanSheetPercentage:parseFloat(o[0].data[1].stats.seasonCSPercentage_overall),AveragePossession:parseFloat(o[0].data[1].stats.possessionAVG_overall),AverageShotsOnTarget:parseFloat(o[0].data[1].stats.shotsOnTargetAVG_overall),AverageDangerousAttacks:parseFloat(o[0].data[1].stats.dangerous_attacks_avg_overall)},2:{XG:parseFloat(o[0].data[2].stats.xg_for_avg_overall),ScoredOverall:parseFloat(o[0].data[2].stats.seasonScoredNum_overall),ConcededOverall:parseFloat(o[0].data[2].stats.seasonConcededNum_overall),XGAgainstAvg:parseFloat(o[0].data[2].stats.xg_against_avg_overall),CleanSheetPercentage:parseFloat(o[0].data[2].stats.seasonCSPercentage_overall),AveragePossession:parseFloat(o[0].data[2].stats.possessionAVG_overall),AverageShotsOnTarget:parseFloat(o[0].data[2].stats.shotsOnTargetAVG_overall),AverageDangerousAttacks:parseFloat(o[0].data[2].stats.dangerous_attacks_avg_overall)}},away:{teamName:i.awayTeam,0:{XG:parseFloat(o[1].data[0].stats.xg_for_avg_overall),ScoredOverall:parseFloat(o[1].data[0].stats.seasonScoredNum_overall),ConcededOverall:parseFloat(o[1].data[0].stats.seasonConcededNum_overall),XGAgainstAvg:parseFloat(o[1].data[0].stats.xg_against_avg_overall),CleanSheetPercentage:parseFloat(o[1].data[0].stats.seasonCSPercentage_overall),AveragePossession:parseFloat(o[1].data[0].stats.possessionAVG_overall),AverageShotsOnTarget:parseFloat(o[1].data[0].stats.shotsOnTargetAVG_overall),AverageDangerousAttacks:parseFloat(o[1].data[0].stats.dangerous_attacks_avg_overall)},1:{XG:parseFloat(o[1].data[1].stats.xg_for_avg_overall),ScoredOverall:parseFloat(o[1].data[1].stats.seasonScoredNum_overall),ConcededOverall:parseFloat(o[1].data[1].stats.seasonConcededNum_overall),XGAgainstAvg:parseFloat(o[1].data[1].stats.xg_against_avg_overall),CleanSheetPercentage:parseFloat(o[1].data[1].stats.seasonCSPercentage_overall),AveragePossession:parseFloat(o[1].data[1].stats.possessionAVG_overall),AverageShotsOnTarget:parseFloat(o[1].data[1].stats.shotsOnTargetAVG_overall),AverageDangerousAttacks:parseFloat(o[1].data[1].stats.dangerous_attacks_avg_overall)},2:{XG:parseFloat(o[1].data[2].stats.xg_for_avg_overall),ScoredOverall:parseFloat(o[1].data[2].stats.seasonScoredNum_overall),ConcededOverall:parseFloat(o[1].data[2].stats.seasonConcededNum_overall),XGAgainstAvg:parseFloat(o[1].data[2].stats.xg_against_avg_overall),CleanSheetPercentage:parseFloat(o[1].data[2].stats.seasonCSPercentage_overall),AveragePossession:parseFloat(o[1].data[2].stats.possessionAVG_overall),AverageShotsOnTarget:parseFloat(o[1].data[2].stats.shotsOnTargetAVG_overall),AverageDangerousAttacks:parseFloat(o[1].data[2].stats.dangerous_attacks_avg_overall)}}});case 29:return i.homeBadge=r.home_image,i.awayBadge=r.away_image,i.homePpg=r.home_ppg.toFixed(2),e.next=34,O(i.homePpg);case 34:return i.homeFormColour=e.sent,i.awayPpg=r.away_ppg.toFixed(2),e.next=38,O(i.awayPpg);case 38:return i.awayFormColour=e.sent,i.status=r.status,i.btts_potential=r.btts_potential,i.game=i.homeTeam+" v "+i.awayTeam,i.homeGoals=r.homeGoalCount,i.awayGoals=r.awayGoalCount,Q.push(i),e.next=47,ye(i,!1);case 47:e.next=4;break;case 49:e.next=54;break;case 51:e.prev=51,e.t0=e.catch(2),t.e(e.t0);case 54:return e.prev=54,t.f(),e.finish(54);case 57:case"end":return e.stop()}}),e,null,[[2,51,54,57]])})),m=0;case 30:if(!(m<Ne.length)){e.next=35;break}return e.delegateYield(p(m),"t1",32);case 32:m++,e.next=30;break;case 35:if(d){e.next=38;break}return e.next=38,fetch("".concat("https://pacific-depths-00420.herokuapp.com/","allForm").concat(a),{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({allForm:Oe})});case 38:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var _e=function(e){return Object(s.jsx)("div",{className:e.className,children:Object(s.jsx)("div",{children:e.text})})},Te=t(56);n.a.Component;t(18).config();var Se="https://safe-caverns-99679.herokuapp.com/",Ce=[],Ge=[],Ne=[];!function(){var e=Object(d.a)(l.a.mark((function e(){var a,t,r,n,o,i,u,p;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(Se+"https://api.footystats.org/league-list?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&chosen_leagues_only=true"));case 2:return a=e.sent,e.next=5,a.json().then((function(e){t=Array.from(e.data)}));case 5:for(r=0;r<t.length;r++){for(p=function(e,a,t){return e.sort((function(e,s){var r=e.element[t],n=s.element[t];return a.indexOf(r)>a.indexOf(n)?1:-1})),e},n=t[r],o=t[r].name,i=0;i<n.season.length;i++)20202021===(u=n.season[i]).year&&Ge.push({name:o,element:u});Ne=p(Ge,[4759,4912,4845,4844,5018,4944,4478,4673,4889,4889,4746,4567,4505,4842,4972,4676,4645,4547,4902,4903,4803,5151,4930,4655,4930,4693],"id")}c.a.render(Object(s.jsxs)("div",{className:"LastXGames",children:[Object(s.jsx)(x,{value:"5",label:"form based on last 5 games",className:"FormRadio"}),Object(s.jsx)(x,{value:"6",label:"form based on last 6 games",className:"FormRadio"}),Object(s.jsx)(x,{value:"10",label:"form based on last 10 games",className:"FormRadio"})]}),document.getElementById("RadioButtons")),c.a.render(Object(s.jsx)(_e,{text:"Select how many games you would like to fetch form data for",className:"RadioText"}),document.getElementById("RadioText")),c.a.render(Object(s.jsxs)("div",{className:"FixtureButtons",children:[Object(s.jsx)(v,{text:"Get Yesterday's Fixtures",onClickEvent:Object(d.a)(l.a.mark((function e(){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=Ce,e.next=3,Ae("yesterdaysFixtures",f);case 3:return e.t1=e.sent,e.abrupt("return",e.t0.push.call(e.t0,e.t1));case 5:case"end":return e.stop()}}),e)})))}),Object(s.jsx)(v,{text:"Get Today's Fixtures",onClickEvent:Object(d.a)(l.a.mark((function e(){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=Ce,e.next=3,Ae("todaysFixtures",f);case 3:return e.t1=e.sent,e.abrupt("return",e.t0.push.call(e.t0,e.t1));case 5:case"end":return e.stop()}}),e)})))}),Object(s.jsx)(v,{text:"Get Tomorrow's Fixtures",onClickEvent:Object(d.a)(l.a.mark((function e(){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=Ce,e.next=3,Ae("tomorrowsFixtures",f);case 3:return e.t1=e.sent,e.abrupt("return",e.t0.push.call(e.t0,e.t1));case 5:case"end":return e.stop()}}),e)})))})]}),document.getElementById("Buttons"));case 9:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()();var Pe=function(){return Object(s.jsxs)("div",{className:"App",children:[Object(s.jsx)(u,{}),Object(s.jsxs)("div",{id:"RadioContainer",className:"RadioContainer",children:[Object(s.jsx)("div",{id:"RadioText"}),Object(s.jsx)("div",{id:"RadioButtons"})]}),Object(s.jsx)("div",{id:"Day"}),Object(s.jsx)("div",{id:"Buttons"}),Object(s.jsx)("div",{id:"successMeasure"}),Object(s.jsx)("div",{id:"bestPredictions"}),Object(s.jsx)("div",{id:"homeBadge"}),Object(s.jsx)("div",{id:"FixtureContainer"})]})},Be=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,57)).then((function(a){var t=a.getCLS,s=a.getFID,r=a.getFCP,n=a.getLCP,o=a.getTTFB;t(e),s(e),r(e),n(e),o(e)}))};c.a.render(Object(s.jsx)(n.a.StrictMode,{children:Object(s.jsx)(Pe,{})}),document.getElementById("root")),Be()}},[[40,1,2]]]);
//# sourceMappingURL=main.b3eada02.chunk.js.map