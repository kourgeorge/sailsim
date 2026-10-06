// Visual interpretation of the reference material in docs/WORLD-DESTINATIONS.md.
// Settlements are placed geographically; individual buildings are stylized.
export const DESTINATION_CHARACTER = {
  'virgin-islands': {
    vegetation:'palms', architecture:'caribbean', water:'#087aaa', shallows:'#36d9c7', sand:'#f6edd3', grass:'#578541', rock:'#90947a', haze:'#acd4e5', fog:.000045, sun:'#fff3da', sunHeight:.85, turbidity:1.4, cloudCoverage:.52,
    settlements:[{name:'Great Harbour',lat:18.443,lon:-64.751,count:48,radius:320},{name:'Road Town',lat:18.425,lon:-64.618,count:120,radius:600}],
    harbor:{lat:18.4414,lon:-64.748,berths:5,heading:0}, traffic:3, animals:'goat', beachWidth:22,
  },
  grenadines: {
    vegetation:'palms', architecture:'caribbean', water:'#128aa2', shallows:'#51dece', sand:'#f1e9c9', grass:'#768842', rock:'#9f9c76', haze:'#bbdbe2', fog:.000045, sun:'#fff2d0', sunHeight:.95, turbidity:1.8, cloudCoverage:.56,
    settlements:[{name:'Mayreau',lat:12.634,lon:-61.393,count:24,radius:200},{name:'Clifton',lat:12.597,lon:-61.419,count:40,radius:280}],
    harbor:{lat:12.635,lon:-61.398,berths:2,heading:90}, traffic:2, animals:'turtle', beachWidth:28,
  },
  exumas: {
    vegetation:'scrub', architecture:'bahamian', water:'#167dac', shallows:'#53e7d9', sand:'#fff6dc', grass:'#879951', rock:'#c0b990', haze:'#b7deed', fog:.000035, sun:'#fff7de', sunHeight:1.1, turbidity:1.2, cloudCoverage:.57,
    settlements:[{name:'Staniel Cay',lat:24.170,lon:-76.443,count:38,radius:280}],
    harbor:{lat:24.1704,lon:-76.448,berths:7,heading:90}, traffic:4, animals:'pig', beachWidth:35,
  },
  dalmatian: {
    vegetation:'pine', architecture:'adriatic', water:'#135481', shallows:'#59abb0', sand:'#cfc8b0', grass:'#657748', rock:'#c0bcb0', haze:'#ccd7dc', fog:.00005, sun:'#ffe7c1', sunHeight:.7, turbidity:2.8, cloudCoverage:.62,
    settlements:[{name:'Hvar',lat:43.173,lon:16.442,count:180,radius:460}],
    harbor:{lat:43.1693,lon:16.440,berths:12,heading:90}, traffic:6, animals:'gull', beachWidth:5,
    monument:{kind:'fortress',lat:43.1774,lon:16.4426},
  },
  santorini: {
    vegetation:'dry-scrub', architecture:'cycladic', water:'#164878', shallows:'#437e98', sand:'#594c45', grass:'#958362', rock:'#85756c', haze:'#e0cfc1', fog:.00006, sun:'#ffdaad', sunHeight:.48, turbidity:3.4, cloudCoverage:.67,
    settlements:[{name:'Oia',lat:36.461,lon:25.376,count:210,radius:520},{name:'Fira',lat:36.417,lon:25.431,count:230,radius:650}],
    harbor:{lat:36.461,lon:25.368,berths:3,heading:90}, traffic:5, animals:'gull', beachWidth:4,
  },
  geiranger: {
    vegetation:'spruce', architecture:'nordic', water:'#244e60', shallows:'#467e80', sand:'#8d9793', grass:'#5c7950', rock:'#839297', haze:'#aebecb', fog:.00012, sun:'#dce9f0', sunHeight:.55, turbidity:4.6, cloudCoverage:.43,
    settlements:[{name:'Geiranger',lat:62.101,lon:7.206,count:54,radius:360}],
    harbor:{lat:62.104,lon:7.203,berths:3,heading:120}, traffic:2, animals:'goat', beachWidth:3,
    falls:[{lat:62.1071,lon:7.0942,height:250,count:7}],
  },
  seychelles: {
    vegetation:'palms', architecture:'creole', water:'#137d8d', shallows:'#7bddc2', sand:'#f0e3c5', grass:'#437b40', rock:'#baafa1', haze:'#c9e0de', fog:.00007, sun:'#fff1d9', sunHeight:.9, turbidity:2.5, cloudCoverage:.47,
    settlements:[{name:'La Passe',lat:-4.349,lon:55.827,count:55,radius:440},{name:'Anse Réunion',lat:-4.358,lon:55.827,count:24,radius:330}],
    harbor:{lat:-4.347,lon:55.827,berths:4,heading:90}, traffic:2, animals:'tortoise', beachWidth:18,
    boulders:[{lat:-4.372,lon:55.826,radius:350}],
  },
  whitsundays: {
    vegetation:'eucalyptus', architecture:'queensland', water:'#126d91', shallows:'#71d9d0', sand:'#fff9e9', grass:'#6e845b', rock:'#a9a58c', haze:'#bad6e3', fog:.000045, sun:'#fff0d2', sunHeight:.85, turbidity:1.8, cloudCoverage:.52,
    settlements:[{name:'Hamilton Island',lat:-20.347,lon:148.953,count:100,radius:750}],
    harbor:{lat:-20.348,lon:148.948,berths:14,heading:90}, traffic:5, animals:'turtle', beachWidth:42,
  },
  'bora-bora': {
    vegetation:'palms', architecture:'polynesian', water:'#1269a2', shallows:'#53d7ce', sand:'#f3e9cc', grass:'#4d813d', rock:'#878c72', haze:'#c2daea', fog:.00004, sun:'#fff0d6', sunHeight:.9, turbidity:1.7, cloudCoverage:.49,
    settlements:[{name:'Vaitape',lat:-16.507,lon:-151.753,count:75,radius:430}],
    harbor:{lat:-16.506,lon:-151.7545,berths:4,heading:90}, traffic:3, animals:'turtle', beachWidth:26,
    bungalows:[{lat:-16.478,lon:-151.709,count:16},{lat:-16.529,lon:-151.767,count:12}],
  },
  'bay-of-islands': {
    vegetation:'broadleaf', architecture:'weatherboard', water:'#296d82', shallows:'#61aeb0', sand:'#d8ccb2', grass:'#537d43', rock:'#8e9482', haze:'#c5d6de', fog:.000065, sun:'#eef2e0', sunHeight:.7, turbidity:2.2, cloudCoverage:.47,
    settlements:[{name:'Russell',lat:-35.262,lon:174.122,count:75,radius:420},{name:'Paihia',lat:-35.283,lon:174.090,count:90,radius:600}],
    harbor:{lat:-35.261,lon:174.119,berths:7,heading:90}, traffic:4, animals:'dolphin', beachWidth:14,
  },
};
