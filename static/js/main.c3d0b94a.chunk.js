(this.webpackJsonppredictor=this.webpackJsonppredictor||[]).push([[0],{32:function(e,t,a){},41:function(e,t,a){"use strict";a.r(t);var s=a(0),o=a.n(s),n=a(3),r=a.n(n),c=(a(32),a(2)),i=a.n(c),l=a(4),d=a(1);var u=function(){return Object(d.jsx)("div",{children:Object(d.jsx)("h1",{children:"Predictor"})})},m=a(8),f=a(9),p=a(11),h=a(10),g="5",x=function(e){Object(p.a)(a,e);var t=Object(h.a)(a);function a(e){var s;return Object(m.a)(this,a),(s=t.call(this,e)).handleOptionChange=function(){s.setState({selectedOption:s.props.value}),g=s.state.selectedOption},s.state={selectedOption:s.props.value},s}return Object(f.a)(a,[{key:"render",value:function(){return Object(d.jsx)("section",{className:"dark",children:Object(d.jsx)("div",{className:this.props.className,children:Object(d.jsxs)("label",{children:[Object(d.jsx)("input",{type:"radio",name:"lastGames",checked:this.state.checked,onChange:this.handleOptionChange}),Object(d.jsx)("span",{className:"design"}),Object(d.jsxs)("span",{className:"text",children:["Last ",this.props.value," games"]})]})})})}}]),a}(s.Component);function b(e){return Object(d.jsx)("div",{id:"Button",children:Object(d.jsx)("button",{variant:"primary",type:"button",onClick:e.onClickEvent,children:e.text})})}var j=a(20),v=a(7);function O(e){return y.apply(this,arguments)}function y(){return(y=Object(l.a)(i.a.mark((function e(t){var a;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:e.t0=!0,e.next=e.t0===t<.49?3:e.t0===(t>=.5&&t<=1)?5:e.t0===(t>=1.01&&t<=1.25)?7:e.t0===(t>=1.26&&t<=1.5)?9:e.t0===(t>=1.51&&t<=2)?11:e.t0===(t>=2.01&&t<=2.5)?13:e.t0===(t>=2.51&&t<=3)?15:17;break;case 3:return a="#CD5C5C",e.abrupt("break",19);case 5:return a="#F08080",e.abrupt("break",19);case 7:return a="#FFA07A",e.abrupt("break",19);case 9:return a="#FFFFE0",e.abrupt("break",19);case 11:return a="#CFDBC5",e.abrupt("break",19);case 13:return a="#8AA37B",e.abrupt("break",19);case 15:return a="#3F6826",e.abrupt("break",19);case 17:return a="white",e.abrupt("break",19);case 19:return e.abrupt("return",a);case 20:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function w(e){return F.apply(this,arguments)}function F(){return(F=Object(l.a)(i.a.mark((function e(t){var a,s,o,n;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a=[t.homeId,t.awayId],s=[],o=i.a.mark((function e(t){var o,n;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o=a[t],e.next=3,fetch(Ne+"https://api.footystats.org/lastx?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&team_id=")+o);case 3:return n=e.sent,e.next=6,n.json().then((function(e){s[t]=e}));case 6:case"end":return e.stop()}}),e)})),n=0;case 4:if(!(n<a.length)){e.next=9;break}return e.delegateYield(o(n),"t0",6);case 6:n++,e.next=4;break;case 9:return e.abrupt("return",s);case 10:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function k(e){return Object(d.jsx)("img",{src:"https://cdn.footystats.org/img/".concat(e.image),className:e.ClassName,alt:e.alt,"flex-shrink":e.flexShrink})}var A=a(21),_=a.n(A),N=function(e){Object(p.a)(a,e);var t=Object(h.a)(a);function a(){var e;Object(m.a)(this,a);for(var s=arguments.length,o=new Array(s),n=0;n<s;n++)o[n]=arguments[n];return(e=t.call.apply(t,[this].concat(o))).state={isOpen:!1},e.handleOnClick=function(){e.setState((function(e){return{isOpen:!e.isOpen}}))},e}return Object(f.a)(a,[{key:"render",value:function(){return Object(d.jsxs)("div",{style:{fontFamily:"sans-serif"},children:[Object(d.jsx)("button",{onClick:this.handleOnClick,children:this.props.buttonText}),this.state.isOpen&&Object(d.jsx)(_.a,{className:"Collapsable",children:this.props.text})]})}}]),a}(s.Component);var T=function(e){return Object(d.jsxs)("ul",{className:e.className,children:[Object(d.jsx)("li",{children:"Team name - ".concat(e.name)},e.name),Object(d.jsx)("li",{className:"TeamScored",children:"Average goals scored - ".concat(e.goals)},"TeamScored"),Object(d.jsx)("li",{className:"TeamConceeded",children:"Average goals conceeded - ".concat(e.conceeded)},"TeamConceeded"),Object(d.jsx)("li",{className:"TeamPossession",children:"Average possession - ".concat(e.possession,"%")},"TeamPossession"),Object(d.jsx)("li",{className:"TeamXG",children:"Average XG - ".concat(e.XG)},"TeamXG"),Object(d.jsx)("li",{className:"AverageSOT",children:"Average shots on target - ".concat(e.sot)},"AverageSOT"),Object(d.jsx)("li",{className:"DangerousAttacks",children:"Average dangerous attacks - ".concat(e.dangerousAttacks)},"DangerousAttacks")]})};var C,G=function(e){return Object(d.jsx)("div",{className:e.className,children:e.text})};function S(){return(S=Object(l.a)(i.a.mark((function e(t){var a,s,o,n,c,l,u,m;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:5===(a=parseInt(g))?(s=0,o=5):6===a?(s=1,o=6):10===a&&(s=2,o=10),n=t.homeTeam,c=t.awayTeam,l=t.time,[].push({btts:t.btts_potential}),(u=[]).push({name:t.homeTeam,AverageGoals:(t.form.allHomeForm[s].stats.seasonScoredNum_overall/o).toFixed(2),AverageConceeded:(t.form.allHomeForm[s].stats.seasonConcededNum_overall/o).toFixed(2),AverageXG:t.form.allHomeForm[s].stats.xg_for_avg_overall,AveragePossession:t.form.allHomeForm[s].stats.possessionAVG_overall,AverageSOT:t.form.allHomeForm[s].stats.shotsOnTargetAVG_overall,AverageDangerousAttacks:t.form.allHomeForm[s].stats.dangerous_attacks_avg_overall,homeOrAway:"Home"}),(m=[]).push({name:t.awayTeam,AverageGoals:(t.form.allAwayForm[s].stats.seasonScoredNum_overall/o).toFixed(2),AverageConceeded:(t.form.allAwayForm[s].stats.seasonConcededNum_overall/o).toFixed(2),AverageXG:t.form.allAwayForm[s].stats.xg_for_avg_overall,AveragePossession:t.form.allAwayForm[s].stats.possessionAVG_overall,AverageSOT:t.form.allAwayForm[s].stats.shotsOnTargetAVG_overall,AverageDangerousAttacks:t.form.allAwayForm[s].stats.dangerous_attacks_avg_overall,homeOrAway:"Away"}),r.a.render(Object(d.jsx)(G,{className:"MatchTime",text:"Kick off: "+l}),document.getElementById("stats"+n)),r.a.render(Object(d.jsx)(G,{className:"BTTSPotential",text:"BTTS Potential: "+t.btts_potential+"%"}),document.getElementById("BTTSPotential"+t.id)),r.a.render(Object(d.jsx)(T,{className:u[0].homeOrAway,name:u[0].name,goals:u[0].AverageGoals,conceeded:u[0].AverageConceeded,XG:u[0].AverageXG,possession:u[0].AveragePossession,sot:u[0].AverageSOT,dangerousAttacks:u[0].AverageDangerousAttacks},u[0].name),document.getElementById("home"+n)),r.a.render(Object(d.jsx)(T,{className:m[0].homeOrAway,name:m[0].name,goals:m[0].AverageGoals,conceeded:m[0].AverageConceeded,XG:m[0].AverageXG,possession:m[0].AveragePossession,sot:m[0].AverageSOT,dangerousAttacks:m[0].AverageDangerousAttacks},m[0].name),document.getElementById("away"+c));case 15:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function B(e){var t,a,o=e.status,n=C;if(!1===n&&"complete"!==o)return Object(d.jsx)("div",{className:"divider",children:"V"});if(!1===n&&"complete"===o)return Object(d.jsx)("div",{className:"Result",children:"".concat(e.fixture.homeGoals," - ").concat(e.fixture.awayGoals)});if(!0!==n||"complete"!==o)return Object(d.jsx)("div",{className:"score",children:"".concat(e.fixture.goalsA," - ").concat(e.fixture.goalsB)});switch(!0){case e.fixture.homeGoals>e.fixture.awayGoals:t=0,e.fixture.winner=e.fixture.homeTeam;break;case e.fixture.homeGoals===e.fixture.awayGoals:t=1,e.fixture.winner="draw";break;case e.fixture.homeGoals<e.fixture.awayGoals:t=2,e.fixture.winner=e.fixture.awayTeam}switch(!0){case e.fixture.goalsA>e.fixture.goalsB:a=0;break;case e.fixture.goalsA===e.fixture.goalsB:a=1;break;case e.fixture.goalsA<e.fixture.goalsB:a=2}if(t===a){switch(!0){case 0===t:e.fixture.profit=e.fixture.homeOdds;break;case 1===t:e.fixture.profit=e.fixture.drawOdds;break;case 2===t:e.fixture.profit=e.fixture.awayOdds}return Object(d.jsxs)(s.Fragment,{children:[Object(d.jsx)("div",{className:"CorrectResult",children:"".concat(e.fixture.homeGoals," - ").concat(e.fixture.awayGoals)}),Object(d.jsx)("div",{className:"score",children:"".concat(e.fixture.goalsA," - ").concat(e.fixture.goalsB)})]})}return t!==a?(e.fixture.profit=-1,Object(d.jsxs)(s.Fragment,{children:[Object(d.jsx)("div",{className:"Result",children:"".concat(e.fixture.homeGoals," - ").concat(e.fixture.awayGoals)}),Object(d.jsx)("div",{className:"score",children:"".concat(e.fixture.goalsA," - ").concat(e.fixture.goalsB)})]})):void 0}var P=function(e){var t=e.fixture;return Object(d.jsxs)("div",{children:[Object(d.jsxs)("li",{className:"individualFixture",onClick:function(){return function(e){return S.apply(this,arguments)}(t)},children:[Object(d.jsx)("div",{className:"homeForm",style:{backgroundColor:t.homeFormColour},children:t.homePpg}),Object(d.jsx)("div",{className:"homeTeam",children:t.homeTeam}),Object(d.jsx)(B,{result:C,status:t.status,fixture:t}),Object(d.jsx)("div",{className:"awayTeam",children:t.awayTeam}),Object(d.jsx)("div",{className:"awayForm",style:{backgroundColor:t.awayFormColour},children:t.awayPpg}),Object(d.jsx)(k,{image:t.homeBadge,ClassName:"HomeBadge",alt:"Home team badge",flexShrink:5}),Object(d.jsx)(k,{image:t.awayBadge,ClassName:"AwayBadge",alt:"Away team badge"})]},t.id),Object(d.jsxs)("div",{children:[Object(d.jsx)("div",{id:"stats"+t.homeTeam}),Object(d.jsxs)(s.Fragment,{children:[Object(d.jsx)("div",{id:"BTTSPotential"+t.id}),Object(d.jsxs)("div",{className:"StatsContainer",children:[Object(d.jsx)("div",{className:"HomeStats",id:"home"+t.homeTeam}),Object(d.jsx)("div",{className:"AwayStats",id:"away"+t.awayTeam})]})]})]})]})},I="Next to each badge is each team\u2019s points per game picked up at home or away.\n Once the fixtures have loaded, click on \u201cGet Predictions\u201d to get predictions based on form data.\n Click on an individual fixture for detailed stats for both teams.\n If you change your form selection, re-tapping the fixture will fetch new form data.\n You can also fetch fresh predictions based on the newly selected option by re-tapping on \u201cGet Predictions\u201d at any time.\n If a match is resulted, tapping \u201cGet Predictions\u201d will show how accurate the prediction was.\n If no form radio button is chosen, the last 5 games will be used by default".split("\n").map((function(e){return Object(d.jsx)("p",{children:e})})),D=function(e){var t=e.fixtures;return Object(d.jsxs)("div",{children:[Object(d.jsx)(s.Fragment,{children:Object(d.jsx)(N,{buttonText:"How do I use this?",text:I})}),Object(d.jsx)("ul",{children:t.map((function(e,t){return Object(d.jsx)(P,{fixture:e})}))})]})};function R(e){return C=e.result,Object(d.jsx)(D,{fixtures:e.fixtures,result:C})}function X(e,t,a){return E.apply(this,arguments)}function E(){return(E=Object(l.a)(i.a.mark((function e(t,a,s){var o,n,r,c,l,d,u,m,f,p,h,g,x,b,j,v,O,y,w,F,k,A,_;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log("Calculate score called"),r=[t.form.allHomeForm[a].stats,t.form.allAwayForm[a].stats],c=0;case 3:if(!(c<r.length)){e.next=37;break}0!=parseFloat(r[c].xg_for_avg_overall).toFixed(2)?r[c].finishingScore=parseFloat((r[c].seasonScoredNum_overall/s/r[c].xg_for_avg_overall).toFixed(2)):r[c].finishingScore=0,0!=parseFloat(r[c].seasonConcededNum_overall/s).toFixed(2)?r[c].goalieRating=parseFloat((r[c].xg_against_avg_overall/(r[c].seasonConcededNum_overall/s)).toFixed(2)):r[c].goalieRating=2,r[c].defenceScore=parseInt(r[c].seasonCSPercentage_overall),void 0,l=r[c].defenceScore,e.t0=!0,e.next=e.t0===l<20?12:e.t0===(l>=20&&l<40)?14:e.t0===(l>=40&&l<60)?16:e.t0===(l>=60&&l<80)?18:e.t0===l>=80?20:22;break;case 12:return r[c].defenceRating=0,e.abrupt("break",23);case 14:return r[c].defenceRating=.3,e.abrupt("break",23);case 16:return r[c].defenceRating=.7,e.abrupt("break",23);case 18:return r[c].defenceRating=1.1,e.abrupt("break",23);case 20:return r[c].defenceRating=1.5,e.abrupt("break",23);case 22:return e.abrupt("break",23);case 23:return e.t1=parseFloat,e.next=26,je(r[c].finishingScore,1);case 26:return e.t2=e.sent,r[c].finalFinishingScore=(0,e.t1)(e.t2),e.t3=parseFloat,e.next=31,je(r[c].goalieRating,1);case 31:e.t4=e.sent,r[c].finalGoalieRating=(0,e.t3)(e.t4),r[c].forecastedXG=parseFloat(r[c].xg_for_avg_overall+r[c].finalFinishingScore);case 34:c++,e.next=3;break;case 37:return 0==t.homeOdds&&0==t.awayOdds?(o=0,n=0):(o=(1/t.homeOdds).toFixed(2),n=(1/t.awayOdds).toFixed(2)),d=t.form.allHomeForm[a].stats,u=t.form.allAwayForm[a].stats,m=d.finalGoalieRating,f=(d.defenceScore+m)/2,p=u.finalGoalieRating,h=(u.defenceScore+p)/2,g=parseFloat(o),x=parseFloat(n),e.next=48,je(g,x);case 48:return e.t5=e.sent,b=(2*e.t5).toFixed(2),e.next=52,je(x,g);case 52:return e.t6=e.sent,j=(2*e.t6).toFixed(2),v=parseFloat(d.xg_against_avg_overall),O=parseFloat(u.xg_against_avg_overall),y=h>0?parseFloat(b-h/10+.5)+O:parseFloat(b+h/10+.5)+O,w=f>0?parseFloat(j-f/10+.5)+v:parseFloat(j+f/10+.5)+v,F=Math.round(parseFloat(t.homeXG)+y),k=Math.round(parseFloat(t.awayXG)+w),F<0&&(F=0),k<0&&(k=0),A=Math.round(parseFloat(3*F+d.seasonScoredNum_overall/s+d.forecastedXG+u.seasonConcededNum_overall/s)/6),_=Math.round(parseFloat(3*k+u.seasonScoredNum_overall/s+u.forecastedXG+d.seasonConcededNum_overall/s)/6),console.log("DIVIDER"),console.log(s),console.log(t.homeTeam),console.log("homeOdds"),console.log(t.homeOdds),console.log("homeGoals"),console.log(F),console.log("seasonScoredNum_overall"),console.log(d.seasonScoredNum_overall),console.log("forecastedXG"),console.log(d.forecastedXG),console.log("seasonConcededNum_overall"),console.log(u.seasonConcededNum_overall),console.log("homeCalculation"),console.log(y),console.log("defenceScoreHome"),console.log(f),console.log("homeWeighting"),console.log(b),console.log(t.awayTeam),console.log("awayOdds"),console.log(t.awayOdds),console.log("awayGoals"),console.log(k),console.log("seasonScoredNum_overall"),console.log(u.seasonScoredNum_overall),console.log("forecastedXG"),console.log(u.forecastedXG),console.log("seasonConcededNum_overall"),console.log(d.seasonConcededNum_overall),console.log("awayCalculation"),console.log(w),console.log("defenceScoreAway"),console.log(h),console.log("awayWeighting"),console.log(j),console.log("FINAL HOME GOALS"),console.log(A),console.log("FINAL AWAY GOALS"),console.log(_),t.homePrediction=A,t.awayPrediction=_,e.abrupt("return",[A,_]);case 107:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function H(e){for(var t=-1,a=-1,o=0,n=0;n<e.length;n++)if(e[n].profit){var c=parseFloat(e[n].profit);a=(t=parseFloat(t+c)).toFixed(2),o+=1}else a=(t=parseFloat(t+0)).toFixed(2);o>0&&r.a.render(Object(d.jsx)(s.Fragment,{children:Object(d.jsx)(G,{className:"SuccessMeasure",text:"accumulated profit/loss if \xa31 was staked on each of the  ".concat(o," games: \xa3").concat(a)})}),document.getElementById("successMeasure"))}var L=[],M=1,V=[];function W(e){return Y.apply(this,arguments)}function Y(){return(Y=Object(l.a)(i.a.mark((function e(t){var a,o,n,c,u,m,f;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=parseInt(g),L=[],M=1,5===a?(o=0,n=5):6===a?(o=1,n=6):10===a&&(o=2,n=10),c=[],e.next=7,fetch("".concat("https://pacific-depths-00420.herokuapp.com/").concat(t,"Predictions").concat(n));case 7:if(u=e.sent,console.log(c.length),console.log(u.status),200!==u.status){e.next=13;break}return e.next=13,u.json().then((function(e){c=e.fixtures.predictions}));case 13:return m=0,e.next=16,Promise.all(Q.map(function(){var e=Object(l.a)(i.a.mark((function e(t){var a,l,u,p,h,g,x;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!(c.length>0)){e.next=19;break}if(console.log(t.game),f=!0,c[m]){e.next=15;break}return e.next=6,X(t,o,n);case 6:u=e.sent,p=Object(v.a)(u,2),a=p[0],l=p[1],console.log("no prediction"),t.goalsA=a,t.goalsB=l,e.next=17;break;case 15:t.goalsA=c[m].match.goalsA,t.goalsB=c[m].match.goalsB;case 17:e.next=28;break;case 19:return e.next=21,X(t,o,n);case 21:h=e.sent,g=Object(v.a)(h,2),a=g[0],l=g[1],f=!1,t.goalsA=a,t.goalsB=l;case 28:"suspended"===t.status&&(t.goalsA="P",t.goalsB="P"),t.predictionOutcome="unknown",t.goalsA-1>t.goalsB&&0!==t.homeOdds?("complete"===t.status&&t.homeTeam===t.winner?t.predictionOutcome="Won":"complete"===t.status&&t.homeTeam!==t.winner&&(t.predictionOutcome="Lost"),M=parseFloat(M)*parseFloat(t.homeOdds),x={team:t.homeTeam,odds:t.homeOdds,outcome:t.predictionOutcome},L.push(x)):t.goalsB-1>t.goalsA&&0!==t.awayOdds&&("complete"===t.status&&t.awayTeam===t.winner?t.predictionOutcome="Won":"complete"===t.status&&t.awayTeam!==t.winner&&(t.predictionOutcome="Lost"),M=parseFloat(M)*parseFloat(t.awayOdds),x={team:t.awayTeam,odds:t.awayOdds,outcome:t.predictionOutcome},L.push(x)),r.a.render(Object(d.jsx)(R,{fixtures:Q,result:!0,className:"individualFixture"}),document.getElementById("FixtureContainer")),L.length>0&&r.a.render(Object(d.jsx)("div",{children:Object(d.jsx)(s.Fragment,{children:Object(d.jsx)(N,{buttonText:"Predictions of the day",text:Object(d.jsxs)("ul",{className:"BestPredictions",children:[Object(d.jsx)("lh",{children:"To win"}),L.map((function(e){return Object(d.jsxs)("li",{className:e.outcome,children:[e.team," odds: ",e.odds]},e.team)})),Object(d.jsx)("div",{className:"AccumulatedOdds",children:"Accumulator odds: ".concat(M.toFixed(2)," / 1")})]})})})}),document.getElementById("bestPredictions")),V.push({match:t}),m+=1;case 35:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()));case 16:return"yesterdaysFixtures"!==t&&!1===f&&U(V,n,t),e.next=19,H(Q);case 19:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function U(e,t,a){return J.apply(this,arguments)}function J(){return(J=Object(l.a)(i.a.mark((function e(t,a,s){return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("".concat("https://pacific-depths-00420.herokuapp.com/","postPredictions").concat(a).concat(s),{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({predictions:t})});case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var K,q,z=(new Date).getHours();console.log("hour"),console.log(z),a(18).config(),console.log("https://pacific-depths-00420.herokuapp.com/");var Q=[],Z=[],$=(new Date).toLocaleDateString("en-US").split("/"),ee=Object(v.a)($,3),te=ee[0],ae=ee[1],se=ee[2],oe=new Date;oe.setDate((new Date).getDate()+1);var ne=oe.toLocaleDateString("en-US").split("/"),re=Object(v.a)(ne,3),ce=re[0],ie=re[1],le=re[2],de=new Date;de.setDate((new Date).getDate()-1);var ue=de.toLocaleDateString("en-US").split("/"),me=Object(v.a)(ue,3),fe=me[0],pe=me[1],he=me[2],ge="https://api.footystats.org/todays-matches?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&date=").concat(he,"-").concat(fe,"-").concat(pe),xe="https://api.footystats.org/todays-matches?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&date=").concat(se,"-").concat(te,"-").concat(ae),be="https://api.footystats.org/todays-matches?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&date=").concat(le,"-").concat(ce,"-").concat(ie);function je(e,t){return ve.apply(this,arguments)}function ve(){return(ve=Object(l.a)(i.a.mark((function e(t,a){return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",parseFloat(t-a).toFixed(2));case 1:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function Oe(e,t){return ye.apply(this,arguments)}function ye(){return(ye=Object(l.a)(i.a.mark((function e(t,a){return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t.game=t.homeTeam+" v "+t.awayTeam,r.a.render(Object(d.jsx)(R,{fixtures:Q,result:a,className:"individualFixture"}),document.getElementById("FixtureContainer"));case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var we=new Headers;we.append("Origin","https://gregdorward.github.io");function Fe(e,t){return ke.apply(this,arguments)}function ke(){return(ke=Object(l.a)(i.a.mark((function e(t,a){var s,o,n,c,l;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:5===(s=parseInt(a))?o=0:6===s?o=1:10===s&&(o=2),e.t0=t,e.next="yesterdaysFixtures"===e.t0?5:"todaysFixtures"===e.t0?7:"tomorrowsFixtures"===e.t0?9:11;break;case 5:return n=ge,e.abrupt("break",12);case 7:return n=xe,e.abrupt("break",12);case 9:return n=be,e.abrupt("break",12);case 11:return e.abrupt("break",12);case 12:return e.next=14,fetch(Ne+n);case 14:return K=e.sent,e.next=17,K.json().then((function(e){console.log(e),q=Array.from(e.data)}));case 17:r.a.render(Object(d.jsx)(b,{text:"Get Predictions",onClickEvent:function(){return W(t)}}),document.getElementById("Buttons")),c=i.a.mark((function e(t){var a,s,n,r,c,l,d;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:Z=q.filter((function(e){return e.competition_id===Ge[t].element.id})),a=Object(j.a)(Z),e.prev=2,a.s();case 4:if((s=a.n()).done){e.next=52;break}return n=s.value,r=n.date_unix,c=new Date(1e3*r),(l={}).id=n.id,l.competition_id=n.competition_id,l.time=c.toLocaleString("en-US",{hour:"numeric"}),l.homeTeam=n.home_name,l.awayTeam=n.away_name,l.homeOdds=n.odds_ft_1,l.awayOdds=n.odds_ft_2,l.drawOdds=n.odds_ft_x,l.homeId=n.homeID,l.awayId=n.awayID,l.form=[],l.homeTeamInfo=[],l.awayTeamInfo=[],e.next=25,w(l);case 25:return d=e.sent,l.form.allHomeForm=d[0].data,l.form.allAwayForm=d[1].data,l.form.homeTeam=d[0].data[o].stats,l.form.awayTeam=d[1].data[o].stats,l.homeBadge=n.home_image,l.awayBadge=n.away_image,l.homeXG=parseFloat(l.form.homeTeam.xg_for_avg_overall),l.awayXG=parseFloat(l.form.awayTeam.xg_for_avg_overall),l.homePpg=n.home_ppg.toFixed(2),e.next=37,O(l.homePpg);case 37:return l.homeFormColour=e.sent,l.awayPpg=n.away_ppg.toFixed(2),e.next=41,O(l.awayPpg);case 41:return l.awayFormColour=e.sent,l.status=n.status,l.btts_potential=n.btts_potential,l.game=l.homeTeam+" v "+l.awayTeam,l.homeGoals=n.homeGoalCount,l.awayGoals=n.awayGoalCount,Q.push(l),e.next=50,Oe(l,!1);case 50:e.next=4;break;case 52:e.next=57;break;case 54:e.prev=54,e.t0=e.catch(2),a.e(e.t0);case 57:return e.prev=57,a.f(),e.finish(57);case 60:case"end":return e.stop()}}),e,null,[[2,54,57,60]])})),l=0;case 20:if(!(l<Ge.length)){e.next=25;break}return e.delegateYield(c(l),"t1",22);case 22:l++,e.next=20;break;case 25:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var Ae=function(e){return Object(d.jsx)("div",{className:e.className,children:Object(d.jsx)("div",{children:e.text})})},_e=a(57);o.a.Component;a(18).config();var Ne="https://safe-caverns-99679.herokuapp.com/",Te=[],Ce=[],Ge=[];!function(){var e=Object(l.a)(i.a.mark((function e(){var t,a,s,o,n,c,u,m;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(Ne+"https://api.footystats.org/league-list?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&chosen_leagues_only=true"));case 2:return t=e.sent,e.next=5,t.json().then((function(e){a=Array.from(e.data)}));case 5:for(s=0;s<a.length;s++){for(m=function(e,t,a){return e.sort((function(e,s){var o=e.element[a],n=s.element[a];return t.indexOf(o)>t.indexOf(n)?1:-1})),e},o=a[s],n=a[s].name,c=0;c<o.season.length;c++)20202021===(u=o.season[c]).year&&Ce.push({name:n,element:u});Ge=m(Ce,[4759,4912,4845,4844,5018,4944,4478,4673,4889,4889,4746,4567,4505,4842,4972,4676,4645,4547,4902,4903,4803,5151,4930,4655,4930,4693],"id")}r.a.render(Object(d.jsxs)("div",{className:"LastXGames",children:[Object(d.jsx)(x,{value:"5",label:"form based on last 5 games",className:"FormRadio"}),Object(d.jsx)(x,{value:"6",label:"form based on last 6 games",className:"FormRadio"}),Object(d.jsx)(x,{value:"10",label:"form based on last 10 games",className:"FormRadio"})]}),document.getElementById("RadioButtons")),r.a.render(Object(d.jsx)(Ae,{text:"Select how many games you would like to fetch form data for",className:"RadioText"}),document.getElementById("RadioText")),r.a.render(Object(d.jsxs)("div",{className:"FixtureButtons",children:[Object(d.jsx)(b,{text:"Get Yesterday's Fixtures",onClickEvent:Object(l.a)(i.a.mark((function e(){return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=Te,e.next=3,Fe("yesterdaysFixtures",g);case 3:return e.t1=e.sent,e.abrupt("return",e.t0.push.call(e.t0,e.t1));case 5:case"end":return e.stop()}}),e)})))}),Object(d.jsx)(b,{text:"Get Today's Fixtures",onClickEvent:Object(l.a)(i.a.mark((function e(){return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=Te,e.next=3,Fe("todaysFixtures",g);case 3:return e.t1=e.sent,e.abrupt("return",e.t0.push.call(e.t0,e.t1));case 5:case"end":return e.stop()}}),e)})))}),Object(d.jsx)(b,{text:"Get Tomorrow's Fixtures",onClickEvent:Object(l.a)(i.a.mark((function e(){return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=Te,e.next=3,Fe("tomorrowsFixtures",g);case 3:return e.t1=e.sent,e.abrupt("return",e.t0.push.call(e.t0,e.t1));case 5:case"end":return e.stop()}}),e)})))})]}),document.getElementById("Buttons"));case 9:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()();var Se=function(){return Object(d.jsxs)("div",{className:"App",children:[Object(d.jsx)(u,{}),Object(d.jsxs)("div",{id:"RadioContainer",className:"RadioContainer",children:[Object(d.jsx)("div",{id:"RadioText"}),Object(d.jsx)("div",{id:"RadioButtons"})]}),Object(d.jsx)("div",{id:"Day"}),Object(d.jsx)("div",{id:"Buttons"}),Object(d.jsx)("div",{id:"successMeasure"}),Object(d.jsx)("div",{id:"bestPredictions"}),Object(d.jsx)("div",{id:"homeBadge"}),Object(d.jsx)("div",{id:"FixtureContainer"})]})},Be=function(e){e&&e instanceof Function&&a.e(3).then(a.bind(null,58)).then((function(t){var a=t.getCLS,s=t.getFID,o=t.getFCP,n=t.getLCP,r=t.getTTFB;a(e),s(e),o(e),n(e),r(e)}))};r.a.render(Object(d.jsx)(o.a.StrictMode,{children:Object(d.jsx)(Se,{})}),document.getElementById("root")),Be()}},[[41,1,2]]]);
//# sourceMappingURL=main.c3d0b94a.chunk.js.map