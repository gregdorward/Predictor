(this.webpackJsonppredictor=this.webpackJsonppredictor||[]).push([[0],{20:function(e,a,t){},28:function(e,a,t){"use strict";t.r(a);var n=t(0),s=t(2),r=t.n(s),c=t(4),o=t.n(c),i=(t(20),t(1)),d=t.n(i),l=t(3);var u=function(){return Object(n.jsx)("div",{children:Object(n.jsx)("h1",{children:"Predictor"})})},m=t(6),h=t(7),p=t(9),f=t(8),j="5",b=function(e){Object(p.a)(t,e);var a=Object(f.a)(t);function t(e){var n;return Object(m.a)(this,t),(n=a.call(this,e)).handleOptionChange=function(){n.setState({selectedOption:n.props.value}),j=n.state.selectedOption},n.state={selectedOption:n.props.value},n}return Object(h.a)(t,[{key:"render",value:function(){return Object(n.jsx)("section",{className:"dark",children:Object(n.jsx)("div",{className:this.props.className,children:Object(n.jsxs)("label",{children:[Object(n.jsx)("input",{type:"radio",name:"lastGames",checked:this.state.checked,onChange:this.handleOptionChange}),Object(n.jsx)("span",{className:"design"}),Object(n.jsxs)("span",{className:"text",children:["Last ",this.props.value," games"]})]})})})}}]),t}(s.Component);function g(e){return Object(n.jsx)("div",{id:"Button",children:Object(n.jsx)("button",{variant:"primary",type:"button",onClick:e.onClickEvent,children:e.text})})}var x=t(13),v=t(5);var O,y=function(e){return Object(n.jsxs)("ul",{className:e.className,children:[Object(n.jsx)("li",{children:"Team name - ".concat(e.name)},e.name),Object(n.jsx)("li",{className:"TeamName",children:"Average goals scored - ".concat(e.goals)},"TeamScored"),Object(n.jsx)("li",{className:"TeamName",children:"Average goals conceeded - ".concat(e.conceeded)},"TeamConceeded"),Object(n.jsx)("li",{className:"TeamName",children:"Average possession - ".concat(e.possession,"%")},"TeamPossession"),Object(n.jsx)("li",{className:"TeamName",children:"Average XG - ".concat(e.XG)},"TeamXG")]})},w=[];function F(e,a){return k.apply(this,arguments)}function k(){return(k=Object(l.a)(d.a.mark((function e(a,t){return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",parseFloat(a-t).toFixed(2));case 1:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function C(e){return G.apply(this,arguments)}function G(){return(G=Object(l.a)(d.a.mark((function e(a){var t;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:e.t0=!0,e.next=e.t0===a<.49?3:e.t0===(a>=.5&&a<=1)?5:e.t0===(a>=1.01&&a<=1.25)?7:e.t0===(a>=1.26&&a<=1.5)?9:e.t0===(a>=1.51&&a<=2)?11:e.t0===(a>=2.01&&a<=2.5)?13:e.t0===(a>=2.51&&a<=3)?15:17;break;case 3:return t="#CD5C5C",e.abrupt("break",19);case 5:return t="#F08080",e.abrupt("break",19);case 7:return t="#FFA07A",e.abrupt("break",19);case 9:return t="#FFFFE0",e.abrupt("break",19);case 11:return t="#CFDBC5",e.abrupt("break",19);case 13:return t="#8AA37B",e.abrupt("break",19);case 15:return t="#3F6826",e.abrupt("break",19);case 17:return t="white",e.abrupt("break",19);case 19:return e.abrupt("return",t);case 20:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function N(e,a,t){return A.apply(this,arguments)}function A(){return(A=Object(l.a)(d.a.mark((function e(a,t,n){var s,r,c,o;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return s={},5===(r=parseInt(n))?(c=0,O=5):6===r?(c=1,O=6):10===r&&(c=2,O=10),e.next=5,fetch(he+"https://api.footystats.org/lastx?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&team_id=")+a);case 5:return o=e.sent,e.next=8,o.json().then((function(e){var a;switch(s.averageXGConceded=e.data[c].stats.xg_against_avg_overall,s.name=e.data[c].name,"home"===t?(s.averageXG=e.data[c].stats.xg_for_avg_home,s.averageGoals=e.data[c].stats.seasonScoredAVG_home,s.bttsPercentage=e.data[c].stats.seasonBTTSPercentage_home,s.possessionAVG=e.data[c].stats.possessionAVG_home,s.shotsAVG=e.data[c].stats.shotsAVG_home,s.averageGoalsConceded=e.data[c].stats.seasonConceded_overall/O,a=parseInt(e.data[c].stats.seasonCSPercentage_home)):"away"===t&&(s.averageXG=e.data[c].stats.xg_for_avg_away,s.averageGoals=e.data[c].stats.seasonScoredAVG_away,s.bttsPercentage=e.data[c].stats.seasonBTTSPercentage_away,s.possessionAVG=e.data[c].stats.possessionAVG_away,s.shotsAVG=e.data[c].stats.shotsAVG_away,s.averageGoalsConceded=e.data[c].stats.seasonConceded_overall/O,a=parseInt(e.data[c].stats.seasonCSPercentage_away)),0!=parseFloat(s.averageXG).toFixed(2)?s.finishingScore=parseFloat((s.averageGoals/s.averageXG).toFixed(2)):s.finishingScore=0,0!=parseFloat(s.averageGoalsConceded).toFixed(2)?s.goalieRating=parseFloat((s.averageXGConceded/s.averageGoalsConceded).toFixed(2)):s.goalieRating=2,s.forecastedXG=s.averageXG*s.finishingScore,!0){case a<20:s.defenceRating=0;break;case a>=20&&a<40:s.defenceRating=.2;break;case a>=40&&a<60:s.defenceRating=.4;break;case a>=60&&a<80:s.defenceRating=.8;break;case a>=80:s.defenceRating=1}}));case 8:return e.t0=parseFloat,e.next=11,F(s.finishingScore,1);case 11:return e.t1=e.sent,s.finalFinishingScore=(0,e.t0)(e.t1),e.t2=parseFloat,e.next=16,F(s.goalieRating,1);case 16:return e.t3=e.sent,s.finalGoalieRating=(0,e.t2)(e.t3),w.push(s),e.abrupt("return",s);case 20:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function T(e){return Object(n.jsx)("img",{src:"https://cdn.footystats.org/img/".concat(e.image),className:e.ClassName,alt:e.alt,"flex-shrink":e.flexShrink})}var _=t(14),B=t.n(_),S=function(e){Object(p.a)(t,e);var a=Object(f.a)(t);function t(){var e;Object(m.a)(this,t);for(var n=arguments.length,s=new Array(n),r=0;r<n;r++)s[r]=arguments[r];return(e=a.call.apply(a,[this].concat(s))).state={isOpen:!1},e.handleOnClick=function(){e.setState((function(e){return{isOpen:!e.isOpen}}))},e}return Object(h.a)(t,[{key:"render",value:function(){return Object(n.jsxs)("div",{style:{fontFamily:"sans-serif"},children:[Object(n.jsx)("button",{onClick:this.handleOnClick,children:"info"}),this.state.isOpen&&Object(n.jsx)(B.a,{className:"Collapsable",children:"Fixtures including each team's points per game picked up at home or away. Click on an individual feature for detailed stats. If no form radio button is chosen, the last 5 games will be used by default"})]})}}]),t}(s.Component);var P,X,R=function(e){return Object(n.jsx)("div",{className:e.className,children:e.text})};function I(e,a){return E.apply(this,arguments)}function E(){return(E=Object(l.a)(d.a.mark((function e(a,t){var s,r,c,i,l,u,m,h,p;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:s=t.homeTeam,r=t.awayTeam,c=t.time,i=s,l=w.findIndex((function(e,a){return e.name===i})),u=r,m=w.findIndex((function(e,a){return e.name===u})),(h=[]).push({name:w[l].name,AverageGoals:w[l].averageGoals,AverageConceeded:w[l].averageGoalsConceded,AverageXG:w[l].averageXG,AveragePossession:w[l].possessionAVG,homeOrAway:"Home"}),console.log("FORM DATA HOME"),console.log(h),(p=[]).push({name:w[m].name,AverageGoals:w[m].averageGoals,AverageConceeded:w[m].averageGoalsConceded,AverageXG:w[m].averageXG,AveragePossession:w[m].possessionAVG,homeOrAway:"Away"}),o.a.render(Object(n.jsx)(R,{className:"MatchTime",text:"Kick off: "+c}),document.getElementById("stats"+s)),o.a.render(Object(n.jsx)(y,{className:h[0].homeOrAway,name:h[0].name,goals:h[0].AverageGoals,conceeded:h[0].AverageConceeded,XG:h[0].AverageXG,possession:h[0].AveragePossession},h[0].name),document.getElementById("home"+s)),o.a.render(Object(n.jsx)(y,{className:p[0].homeOrAway,name:p[0].name,goals:p[0].AverageGoals,conceeded:p[0].AverageConceeded,XG:p[0].AverageXG,possession:p[0].AveragePossession},p[0].name),document.getElementById("away"+r));case 16:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function D(e){return V.apply(this,arguments)}function V(){return(V=Object(l.a)(d.a.mark((function e(a){var t,n;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(he+"https://api.footystats.org/match?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&match_id=")+a.id);case 2:return t=e.sent,e.next=5,t.json().then((function(e){var a=e.data.trends.team_a,t=e.data.trends.team_b;n=a.concat(t)}));case 5:I(n,a);case 6:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function M(e){return!1===e.result?Object(n.jsx)("ul",{id:"fixtures",className:"container",children:Object(n.jsxs)("div",{className:"fixture",children:[Object(n.jsx)(S,{}),e.fixtures.map((function(e){return Object(n.jsxs)("div",{children:[Object(n.jsxs)("li",{onMouseEnter:function(e){return e.target.style.color="orange"},onMouseLeave:function(e){return e.target.style.color=""},className:"individualFixture",onClick:function(){return D(e)},children:[Object(n.jsx)("div",{className:"homeForm",style:{backgroundColor:e.homeFormColour},children:e.homePpg}),Object(n.jsx)("div",{className:"homeTeam",children:e.homeTeam}),Object(n.jsx)("div",{className:"divider",children:"V"}),Object(n.jsx)("div",{className:"awayTeam",children:e.awayTeam}),Object(n.jsx)("div",{className:"awayForm",style:{backgroundColor:e.awayFormColour},children:e.awayPpg}),Object(n.jsx)(T,{image:e.homeBadge,ClassName:"HomeBadge",alt:"Home team badge",flexShrink:5}),Object(n.jsx)(T,{image:e.awayBadge,ClassName:"AwayBadge",alt:"Away team badge"})]},e.id),Object(n.jsxs)("div",{children:[Object(n.jsx)("div",{id:"stats"+e.homeTeam}),Object(n.jsxs)("div",{className:"StatsContainer",children:[Object(n.jsx)("div",{className:"HomeStats",id:"home"+e.homeTeam}),Object(n.jsx)("div",{className:"AwayStats",id:"away"+e.awayTeam})]})]})]})}))]})}):!0===e.result?Object(n.jsx)("ul",{id:"fixtures",className:"container",children:Object(n.jsxs)("div",{className:"fixture",children:[Object(n.jsx)(S,{}),e.matches.map((function(e){return Object(n.jsxs)("div",{children:[Object(n.jsxs)("li",{onMouseEnter:function(e){return e.target.style.color="orange"},onMouseLeave:function(e){return e.target.style.color=""},className:"individualFixture",onClick:function(){return D(e)},children:[Object(n.jsx)("div",{className:"homeForm",style:{backgroundColor:e.homeFormColour},children:e.homePpg}),Object(n.jsx)("div",{className:"homeTeam",children:e.homeTeam}),Object(n.jsx)("div",{className:"score",children:"".concat(e.goalsA," - ").concat(e.goalsB)}),Object(n.jsx)("div",{className:"awayTeam",children:e.awayTeam}),Object(n.jsx)("div",{className:"awayForm",style:{backgroundColor:e.awayFormColour},children:e.awayPpg}),Object(n.jsx)(T,{image:e.homeBadge,ClassName:"HomeBadge",alt:"Home team badge",flexShrink:5}),Object(n.jsx)(T,{image:e.awayBadge,ClassName:"AwayBadge",alt:"Away team badge"})]},e.id),Object(n.jsxs)("div",{className:"StatsContainer",id:"stats"+e.homeTeam,children:[Object(n.jsx)("div",{className:"HomeStats",id:"home"+e.homeTeam}),Object(n.jsx)("div",{className:"AwayStats",id:"away"+e.awayTeam})]})]})}))]})}):void 0}function L(e){return H.apply(this,arguments)}function H(){return(H=Object(l.a)(d.a.mark((function e(a){var t,n,s,r,c,o,i,l,u,m,h,p,f,j,b,g,x,v,O,y,w,k,C,G,N,A;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return 0==a.homeOdds&&0==a.awayOdds?(t=0,n=0):(t=(1/a.homeOdds).toFixed(2),n=(1/a.awayOdds).toFixed(2)),s=a.homeTeamForm,r=a.awayTeamForm,c=s.finalFinishingScore,o=parseFloat(s.defenceRating),i=s.finalGoalieRating,l=s.forecastedXG,u=(o+i)/2,m=r.finalFinishingScore,h=parseFloat(r.defenceRating),p=r.finalGoalieRating,f=r.forecastedXG,j=(h+p)/2,b=parseFloat(a.homeXG),g=parseFloat(a.awayXG),x=(l+b)/2,v=(f+g)/2,O=parseFloat(t),y=parseFloat(n),e.next=21,F(O,y);case 21:return e.t0=e.sent,w=(1*e.t0).toFixed(2),e.next=25,F(y,O);case 25:return e.t1=e.sent,k=(1*e.t1).toFixed(2),C=parseFloat(w+c)-j,G=parseFloat(k+m)-u,C<-1&&(G-=C/2,C=-1),G<-1&&(C-=G/2,G=-1),N=Math.round(parseFloat(x)+C),A=Math.round(parseFloat(v)+G),e.abrupt("return",[N,A]);case 34:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function U(){return J.apply(this,arguments)}function J(){return(J=Object(l.a)(d.a.mark((function e(){return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Promise.all(Y.map(function(){var e=Object(l.a)(d.a.mark((function e(a){var t,s,r,c;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,L(a);case 2:t=e.sent,s=Object(v.a)(t,2),r=s[0],c=s[1],a.goalsA=r,a.goalsB=c,"suspended"===a.status&&(r="P",c="P"),o.a.render(Object(n.jsx)(M,{match:a,matches:Y,result:!0}),document.getElementById("FixtureContainer"));case 10:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}()));case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var K,Y=[],q=[],z=(new Date).toLocaleDateString("en-US").split("/"),Q=Object(v.a)(z,3),W=Q[0],Z=Q[1],$=Q[2],ee=new Date;ee.setDate((new Date).getDate()+1);var ae=ee.toLocaleDateString("en-US").split("/"),te=Object(v.a)(ae,3),ne=te[0],se=te[1],re=te[2],ce="https://api.footystats.org/todays-matches?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&date=").concat($,"-").concat(W,"-").concat(Z),oe="https://api.footystats.org/todays-matches?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&date=").concat(re,"-").concat(ne,"-").concat(se);function ie(e){return de.apply(this,arguments)}function de(){return(de=Object(l.a)(d.a.mark((function e(a){return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a.game=a.homeTeam+" v "+a.awayTeam,o.a.render(Object(n.jsx)(M,{fixtures:Y,result:!1}),document.getElementById("FixtureContainer"));case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function le(e,a){return ue.apply(this,arguments)}function ue(){return(ue=Object(l.a)(d.a.mark((function e(a,t){var s,r;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return K=t,e.next=3,fetch(he+a);case 3:return P=e.sent,e.next=6,P.json().then((function(e){X=Array.from(e.data)}));case 6:s=d.a.mark((function e(a){var t,n,s,r,c,o;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:q=X.filter((function(e){return e.competition_id===je[a].element.id})),t=Object(x.a)(q),e.prev=2,t.s();case 4:if((n=t.n()).done){e.next=46;break}return s=n.value,console.log(s),r=s.date_unix,c=new Date(1e3*r),(o={}).id=s.id,o.time=c.toLocaleString("en-US",{hour:"numeric"}),console.log(o.time),o.homeTeam=s.home_name,o.awayTeam=s.away_name,o.homeOdds=s.odds_ft_1,o.awayOdds=s.odds_ft_2,o.homeId=s.homeID,o.awayId=s.awayID,e.next=22,N(o.homeId,"home",K);case 22:return o.homeTeamForm=e.sent,e.next=25,N(o.awayId,"away",K);case 25:return o.awayTeamForm=e.sent,o.homeBadge=s.home_image,o.awayBadge=s.away_image,o.homeXG=parseFloat(s.team_a_xg_prematch),o.awayXG=parseFloat(s.team_b_xg_prematch),o.homePpg=s.home_ppg.toFixed(2),e.next=33,C(o.homePpg);case 33:return o.homeFormColour=e.sent,o.awayPpg=s.away_ppg.toFixed(2),e.next=37,C(o.awayPpg);case 37:return o.awayFormColour=e.sent,o.status=s.status,o.btts_potential=s.btts_potential,o.game=o.homeTeam+" v "+o.awayTeam,Y.push(o),e.next=44,ie(o);case 44:e.next=4;break;case 46:e.next=51;break;case 48:e.prev=48,e.t0=e.catch(2),t.e(e.t0);case 51:return e.prev=51,t.f(),e.finish(51);case 54:case"end":return e.stop()}}),e,null,[[2,48,51,54]])})),r=0;case 8:if(!(r<je.length)){e.next=13;break}return e.delegateYield(s(r),"t0",10);case 10:r++,e.next=8;break;case 13:o.a.render(Object(n.jsx)(g,{text:"Get Predictions",onClickEvent:function(){return U()}}),document.getElementById("Buttons"));case 14:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var me=function(e){return Object(n.jsx)("div",{className:e.className,children:Object(n.jsx)("div",{children:e.text})})};t(25).config();var he="https://safe-caverns-99679.herokuapp.com/",pe=[],fe=[],je=[];!function(){var e=Object(l.a)(d.a.mark((function e(){var a,t,s,r,c,i,u,m;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(he+"https://api.footystats.org/league-list?key=".concat("b9c4c927b39f4c66a3e3c4e4fbfeff999c911069d1df704de1221230800cd79b","&chosen_leagues_only=true"));case 2:return a=e.sent,e.next=5,a.json().then((function(e){t=Array.from(e.data)}));case 5:for(s=0;s<t.length;s++){for(m=function(e,a,t){return e.sort((function(e,n){var s=e.element[t],r=n.element[t];return a.indexOf(s)>a.indexOf(r)?1:-1})),e},r=t[s],c=t[s].name,i=0;i<r.season.length;i++)20202021===(u=r.season[i]).year&&fe.push({name:c,element:u});je=m(fe,[4759,4912,4845,4844,5018,4944,4478,4673,4889,4889,4746,4567,4505,4842,4972,4676,4645,4547,4902,4903,4803,5151,4930,4655,4930,4693],"id")}o.a.render(Object(n.jsxs)("div",{className:"LastXGames",children:[Object(n.jsx)(b,{value:"5",label:"form based on last 5 games",className:"FormRadio"}),Object(n.jsx)(b,{value:"6",label:"form based on last 6 games",className:"FormRadio"}),Object(n.jsx)(b,{value:"10",label:"form based on last 10 games",className:"FormRadio"})]}),document.getElementById("RadioButtons")),o.a.render(Object(n.jsx)(me,{text:"Select how many games you would like to fetch form data for",className:"RadioText"}),document.getElementById("RadioText")),o.a.render(Object(n.jsxs)("div",{className:"FixtureButtons",children:[Object(n.jsx)(g,{text:"Get Today's Fixtures",onClickEvent:Object(l.a)(d.a.mark((function e(){return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=pe,e.next=3,le(ce,j);case 3:return e.t1=e.sent,e.abrupt("return",e.t0.push.call(e.t0,e.t1));case 5:case"end":return e.stop()}}),e)})))}),Object(n.jsx)(g,{text:"Get Tomorrow's Fixtures",onClickEvent:Object(l.a)(d.a.mark((function e(){return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=pe,e.next=3,le(oe,j);case 3:return e.t1=e.sent,e.abrupt("return",e.t0.push.call(e.t0,e.t1));case 5:case"end":return e.stop()}}),e)})))})]}),document.getElementById("Buttons"));case 9:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()();var be=function(){return Object(n.jsxs)("div",{className:"App",children:[Object(n.jsx)(u,{}),Object(n.jsxs)("div",{id:"RadioContainer",className:"RadioContainer",children:[Object(n.jsx)("div",{id:"RadioText"}),Object(n.jsx)("div",{id:"RadioButtons"})]}),Object(n.jsx)("div",{id:"Day"}),Object(n.jsx)("div",{id:"Buttons"}),Object(n.jsx)("div",{id:"homeBadge"}),Object(n.jsx)("div",{id:"FixtureContainer"})]})},ge=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,29)).then((function(a){var t=a.getCLS,n=a.getFID,s=a.getFCP,r=a.getLCP,c=a.getTTFB;t(e),n(e),s(e),r(e),c(e)}))};o.a.render(Object(n.jsx)(r.a.StrictMode,{children:Object(n.jsx)(be,{})}),document.getElementById("root")),ge()}},[[28,1,2]]]);
//# sourceMappingURL=main.6d274e3d.chunk.js.map