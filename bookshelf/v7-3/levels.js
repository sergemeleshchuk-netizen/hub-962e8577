/* =========================================================
   LEVELS — design layer (v5 curve). What each level should be; gen.js turns it into a concrete, verified layout.
   Read together with docs: "Difficulty Curve & Level Balancing 1–500".
   ========================================================= */
const ART=[
 {id:'mona',   file:'v7/art/01_mona_capybara.jpg',     title:'Mona Capybara',            after:'after Leonardo da Vinci',      album:'Old Masters'},
 {id:'wave',   file:'v7/art/02_boba_wave.jpg',         title:'The Great Boba Wave',      after:'after Katsushika Hokusai',    album:'Old Masters'},
 {id:'starry', file:'v7/art/03_starry_catstronaut.jpg',title:'Starry Night Cat-stronaut',after:'after Vincent van Gogh',       album:'Old Masters'},
 {id:'pearl',  file:'v7/art/04_axolotl_pearl.jpg',     title:'Axolotl with a Pearl Earring',after:'after Johannes Vermeer',   album:'Old Masters'},
 {id:'scream', file:'v7/art/05_monday_scream.jpg',     title:'The Monday Scream',        after:'after Edvard Munch',          album:'Modern Moods'},
 {id:'kiss',   file:'v7/art/06_raccoon_kiss.jpg',      title:'The Raccoon Kiss',         after:'after Gustav Klimt',          album:'Modern Moods'},
 {id:'sun',    file:'v7/art/07_sunflower_hamsters.jpg',title:'Sunflowers & Hamsters',    after:'after Vincent van Gogh',       album:'Modern Moods'},
 {id:'venus',  file:'v7/art/08_birth_of_otter.jpg',    title:'The Birth of Otter',       after:'after Sandro Botticelli',      album:'Modern Moods'},
 {id:'fog',    file:'v7/art/09_penguin_fog.jpg',       title:'Penguin above the Fog',    after:'after Caspar David Friedrich', album:'Grand Tour'},
 {id:'fuji',   file:'v7/art/10_red_fuji_corgi.jpg',    title:'Red Fuji Corgi',           after:'after Katsushika Hokusai',     album:'Grand Tour'},
 {id:'cafe',   file:'v7/art/11_shiba_cafe.jpg',        title:'Shiba Café at Night',      after:'after Vincent van Gogh',       album:'Grand Tour'},
 {id:'adam',   file:'v7/art/12_creation_of_cat.jpg',   title:'The Creation of Cat',      after:'after Michelangelo',           album:'Grand Tour'},
 {id:'sloth',  file:'v7/art/13_sloth_bedroom.jpg',     title:"The Sloth's Bedroom",      after:'after Vincent van Gogh',       album:'Impressionist Garden'},
 {id:'pugs',   file:'v7/art/14_pug_picnic.jpg',        title:'Sunday Picnic of the Pugs',after:'after Georges Seurat',         album:'Impressionist Garden'},
 {id:'frog',   file:'v7/art/15_frog_bridge.jpg',       title:"The Frog Prince's Bridge", after:'after Claude Monet',           album:'Impressionist Garden'},
 {id:'glean',  file:'v7/art/16_hedgehog_gleaners.jpg', title:'The Hedgehog Gleaners',    after:'after Jean-François Millet',   album:'Impressionist Garden'},
 {id:'watch',  file:'v7/art/17_meerkat_watch.jpg',     title:'The Meerkat Night Watch',  after:'after Rembrandt',              album:'Grand Gallery'},
 {id:'snow',   file:'v7/art/18_fox_hunters.jpg',       title:'Fox Hunters in the Snow',  after:'after Pieter Bruegel',         album:'Grand Gallery'},
 {id:'jungle', file:'v7/art/19_surprised_kitten.jpg',  title:'Surprised! Kitten',        after:'after Henri Rousseau',         album:'Grand Gallery'},
 {id:'menin',  file:'v7/art/20_puppy_meninas.jpg',     title:'Las Puppy Meninas',        after:'after Diego Velázquez',        album:'Grand Gallery'},
 {id:'milk',   file:'v7/art/21_milkmaid_cat.jpg',      title:'The Milkmaid Cat',          after:'after Johannes Vermeer',       album:'Salon de Paris'},
 {id:'dance',  file:'v7/art/22_flamingo_dance.jpg',    title:'Flamingo Dance Class',      after:'after Edgar Degas',            album:'Salon de Paris'},
 {id:'boat',   file:'v7/art/23_beaver_boating.jpg',    title:"The Beavers' Boating Party",after:'after Pierre-Auguste Renoir',  album:'Salon de Paris'},
 {id:'swing',  file:'v7/art/24_koala_swing.jpg',       title:'Koala on the Swing',        after:'after Jean-Honoré Fragonard',  album:'Salon de Paris'},
 {id:'blue',   file:'v7/art/25_blue_bunny.jpg',        title:'The Blue Bunny Boy',        after:'after Thomas Gainsborough',    album:'Salon de Paris'},
 {id:'turtle', file:'v7/art/26_turtle_temeraire.jpg',  title:'The Turtle Temeraire',      after:'after J. M. W. Turner',        album:'Far Horizons'},
 {id:'shower', file:'v7/art/27_duckling_shower.jpg',   title:'Ducklings in the Shower',   after:'after Utagawa Hiroshige',      album:'Far Horizons'},
 {id:'tree',   file:'v7/art/28_owl_tree_of_life.jpg',  title:'Owl in the Tree of Life',   after:'after Gustav Klimt',           album:'Far Horizons'},
 {id:'almond', file:'v7/art/29_bunny_almond.jpg',      title:'Bunny in Almond Blossom',   after:'after Vincent van Gogh',       album:'Far Horizons'},
 {id:'babel',  file:'v7/art/30_tower_of_books.jpg',    title:'The Tower of Books',        after:'after Pieter Bruegel',         album:'Far Horizons'},
 {id:'goat',   file:'v7/art/31_goat_gothic.jpg',      title:'American Goat-hic',         after:'after Grant Wood',             album:'Modern Moods'},
 {id:'hawks',   file:'v7/art/32_raccoon_nighthawks.jpg',       title:'Night Paws',                    after:'after Edward Hopper',           album:'Modern Moods'},
 {id:'son',     file:'v7/art/33_penguin_son_of_man.jpg',       title:'The Son of Penguin',            after:'after Rene Magritte',           album:'Modern Moods'},
 {id:'mother',  file:'v7/art/34_whistlers_mother_cat.jpg',     title:'Whistler\'s Mother Cat',         after:'after James McNeill Whistler',  album:'Grand Gallery'},
 {id:'alps',    file:'v7/art/35_corgi_alps.jpg',               title:'Corgi Crossing the Alps',       after:'after Jacques-Louis David',     album:'Grand Tour'},
 {id:'liberty', file:'v7/art/36_goose_liberty.jpg',            title:'Goose Leading the People',      after:'after Eugene Delacroix',        album:'Salon de Paris'},
 {id:'lilies',  file:'v7/art/37_duckling_water_lilies.jpg',    title:'Water Lilies with Ducklings',   after:'after Claude Monet',            album:'Impressionist Garden'},
 {id:'galette', file:'v7/art/38_bunny_moulin.jpg',             title:'Bunnies at the Moulin de la Galette', after:'after Pierre-Auguste Renoir',   album:'Impressionist Garden'},
 {id:'jatte',   file:'v7/art/39_sheep_grande_jatte.jpg',       title:'Sunday Sheep on La Grande Jatte', after:'after Georges Seurat',          album:'Impressionist Garden'},
 {id:'ophelia', file:'v7/art/40_otter_ophelia.jpg',            title:'Otter Ophelia',                 after:'after John Everett Millais',    album:'Grand Gallery'},
 {id:'arnolfini', file:'v7/art/41_hamster_arnolfini.jpg',        title:'The Arnolfini Hamsters',        after:'after Jan van Eyck',            album:'Old Masters'},
 {id:'clocks',  file:'v7/art/42_sloth_persistence.jpg',        title:'The Persistence of Napping',    after:'after Salvador Dali',           album:'Modern Moods'},
 {id:'astro',   file:'v7/art/43_owl_astronomer.jpg',           title:'The Owl Astronomer',            after:'after Johannes Vermeer',        album:'Old Masters'},
 {id:'gypsy',   file:'v7/art/44_kitten_sleeping_gypsy.jpg',    title:'The Sleeping Kitten',           after:'after Henri Rousseau',          album:'Far Horizons'},
 {id:'dancer',  file:'v7/art/45_mouse_dancer.jpg',             title:'Little Mouse Dancer',           after:'after Edgar Degas',             album:'Salon de Paris'},
 {id:'rainy',   file:'v7/art/46_dachshund_rainy_paris.jpg',    title:'Paris Street, Rainy Dachshunds', after:'after Gustave Caillebotte',     album:'Salon de Paris'},
 {id:'rain',   file:'v7/art/47_cat_sudden_shower.jpg',title:'Sudden Shower over the Cat Bridge',after:'after Utagawa Hiroshige',   album:'Far Horizons'},
 {id:'primavera', file:'v7/art/48_fawn_primavera.jpg',           title:'Primavera of the Fawns',        after:'after Sandro Botticelli',       album:'Old Masters'},
 {id:'ermine',  file:'v7/art/49_red_panda_ermine.jpg',         title:'Red Panda with an Ermine',      after:'after Leonardo da Vinci',       album:'Old Masters'},
 {id:'parasol', file:'v7/art/50_llama_parasol.jpg',            title:'Llama with a Parasol',          after:'after Claude Monet',            album:'Impressionist Garden'},
 {id:'cards',file:'v7/art/51_cezanne_raccoon_cards.jpg',title:'The Card Players',after:'after Paul Cezanne',album:'Salon de Paris'},
 {id:'guitar',file:'v7/art/52_picasso_blue_cat_guitar.jpg',title:'The Old Guitarist Cat',after:'after Pablo Picasso',album:'Modern Moods'},
 {id:'goldfish',file:'v7/art/53_matisse_cat_goldfish.jpg',title:'Cat with Goldfish',after:'after Henri Matisse',album:'Modern Moods'},
 {id:'crows',file:'v7/art/54_vangogh_crows_wheatfield.jpg',title:'Wheatfield with Parrots',after:'after Vincent van Gogh',album:'Impressionist Garden'},
 {id:'sunrise',file:'v7/art/55_monet_pelican_sunrise.jpg',title:'Impression, Pelican Rising',after:'after Claude Monet',album:'Impressionist Garden'},
 {id:'bubbles',file:'v7/art/56_chardin_otter_bubbles.jpg',title:'Otter Blowing Bubbles',after:'after Jean-Simeon Chardin',album:'Grand Gallery'},
 {id:'pierrot',file:'v7/art/57_watteau_dog_pierrot.jpg',title:'Pierrot the Puppy',after:'after Antoine Watteau',album:'Grand Gallery'},
 {id:'angelus',file:'v7/art/58_millet_hedgehog_angelus.jpg',title:'The Hedgehog Angelus',after:'after Jean-Francois Millet',album:'Impressionist Garden'},
 {id:'hockney',file:'v7/art/59_hockney_dog_splash.jpg',title:'A Bigger Splash Dog',after:'after David Hockney',album:'Modern Moods'},
 {id:'golconda',file:'v7/art/60_magritte_penguin_golconda.jpg',title:'Golconda Penguins',after:'after Rene Magritte',album:'Modern Moods'},
 {id:'pop',file:'v7/art/61_lichtenstein_pop_cat.jpg',title:'Pop Art Cat',after:'after Roy Lichtenstein',album:'Modern Moods'},
 {id:'automat',file:'v7/art/62_hopper_fox_automat.jpg',title:'Automat Fox',after:'after Edward Hopper',album:'Grand Gallery'},
 {id:'sisters',file:'v7/art/63_renoir_kitten_sisters.jpg',title:'Two Kittens on the Terrace',after:'after Pierre-Auguste Renoir',album:'Salon de Paris'},
 {id:'folies',file:'v7/art/64_manet_bunny_folies.jpg',title:'A Bar at the Bunnies-Bergere',after:'after Edouard Manet',album:'Salon de Paris'},
 {id:'lautrec',file:'v7/art/65_lautrec_flamingo_cancan.jpg',title:'Flamingo Can-Can',after:'after Henri de Toulouse-Lautrec',album:'Salon de Paris'},
 {id:'mucha',file:'v7/art/66_mucha_cat_spring.jpg',title:'Art Nouveau Cat: Spring',after:'after Alphonse Mucha',album:'Grand Gallery'},
 {id:'adele',file:'v7/art/67_klimt_golden_cat.jpg',title:'Golden Cat Adele',after:'after Gustav Klimt',album:'Modern Moods'},
 {id:'birthday',file:'v7/art/68_chagall_rabbits_flying.jpg',title:'The Flying Rabbits',after:'after Marc Chagall',album:'Far Horizons'},
 {id:'nightcafe',file:'v7/art/69_vangogh_cat_bandaged.jpg',title:'Cat with a Bandaged Ear',after:'after Vincent van Gogh',album:'Modern Moods'},
 {id:'potato',file:'v7/art/70_vangogh_moles_potato.jpg',title:'The Potato Eater Moles',after:'after Vincent van Gogh',album:'Far Horizons'},
 {id:'rouen',file:'v7/art/71_monet_pigeons_cathedral.jpg',title:'Pigeon Cathedral at Noon',after:'after Claude Monet',album:'Impressionist Garden'},
 {id:'poppies',file:'v7/art/72_monet_bunnies_poppies.jpg',title:'Bunnies in the Poppy Field',after:'after Claude Monet',album:'Impressionist Garden'},
 {id:'absinthe',file:'v7/art/73_degas_bulldog_absinthe.jpg',title:'Bulldog with Absinthe',after:'after Edgar Degas',album:'Salon de Paris'},
 {id:'cradle',file:'v7/art/74_morisot_cat_cradle.jpg',title:'The Cradle Cat',after:'after Berthe Morisot',album:'Salon de Paris'},
 {id:'bath',file:'v7/art/75_cassatt_bear_bath.jpg',title:'The Cub\'s Bath',after:'after Mary Cassatt',album:'Salon de Paris'},
 {id:'balcony',file:'v7/art/76_goya_kitten_parasol.jpg',title:'Kitten with a Parasol',after:'after Francisco Goya',album:'Grand Tour'},
 {id:'andrews',file:'v7/art/77_gainsborough_sheep_andrews.jpg',title:'Mr and Mrs Ramsworth',after:'after Thomas Gainsborough',album:'Grand Tour'},
 {id:'haywain',file:'v7/art/78_constable_capybara_haywain.jpg',title:'The Capybara Wain',after:'after John Constable',album:'Grand Tour'},
 {id:'monk',file:'v7/art/79_friedrich_penguin_monk.jpg',title:'Penguin by the Sea',after:'after Caspar David Friedrich',album:'Far Horizons'},
 {id:'ninth',file:'v7/art/80_aivazovsky_otters_wave.jpg',title:'The Ninth Wave Otters',after:'after Ivan Aivazovsky',album:'Far Horizons'},
 {id:'pines',file:'v7/art/81_shishkin_red_pandas_pines.jpg',title:'Morning in the Pine Forest',after:'after Ivan Shishkin',album:'Far Horizons'},
 {id:'bogatyrs',file:'v7/art/82_vasnetsov_bears_bogatyrs.jpg',title:'Three Bear Bogatyrs',after:'after Viktor Vasnetsov',album:'Far Horizons'},
 {id:'tea',file:'v7/art/83_kustodiev_cat_tea.jpg',title:'Merchant Cat at Tea',after:'after Boris Kustodiev',album:'Far Horizons'},
 {id:'unknown',file:'v7/art/84_kramskoi_fox_unknown.jpg',title:'The Unknown Fox',after:'after Ivan Kramskoi',album:'Grand Gallery'},
 {id:'olympia',file:'v7/art/85_manet_olympia_cat.jpg',title:'Olympia\'s Cat',after:'after Edouard Manet',album:'Salon de Paris'},
 {id:'lady',file:'v7/art/86_waterhouse_swan_shalott.jpg',title:'The Swan of Shalott',after:'after John William Waterhouse',album:'Grand Gallery'},
 {id:'medusa',file:'v7/art/87_gericault_ducks_raft.jpg',title:'The Raft of the Ducklings',after:'after Theodore Gericault',album:'Grand Tour'},
 {id:'vitruvian',file:'v7/art/88_leonardo_frog_vitruvian.jpg',title:'Vitruvian Frog',after:'after Leonardo da Vinci',album:'Old Masters'},
 {id:'hare',file:'v7/art/89_durer_capybara_hare.jpg',title:'Young Capybara',after:'after Albrecht Durer',album:'Old Masters'},
 {id:'ambassadors',file:'v7/art/90_holbein_foxes_ambassadors.jpg',title:'The Fox Ambassadors',after:'after Hans Holbein',album:'Old Masters'},
 {id:'narcissus',file:'v7/art/91_caravaggio_fox_narcissus.jpg',title:'Narcissus Fox',after:'after Caravaggio',album:'Old Masters'},
 {id:'wedding',file:'v7/art/92_bruegel_pigs_wedding.jpg',title:'The Piglet Wedding',after:'after Pieter Bruegel',album:'Old Masters'},
 {id:'vertumnus',file:'v7/art/93_arcimboldo_bunny_fruit.jpg',title:'Fruit Bunny',after:'after Giuseppe Arcimboldo',album:'Old Masters'},
 {id:'cherubs',file:'v7/art/94_raphael_puppy_cherubs.jpg',title:'The Bored Cherub Puppies',after:'after Raphael',album:'Old Masters'},
 {id:'anatomy',file:'v7/art/95_rembrandt_owls_anatomy.jpg',title:'The Anatomy Lesson of Dr Owl',after:'after Rembrandt',album:'Old Masters'},
 {id:'christina',file:'v7/art/96_wyeth_fox_christina.jpg',title:'Fox\'s World',after:'after Andrew Wyeth',album:'Grand Gallery'},
 {id:'triple',file:'v7/art/97_rockwell_dog_triple.jpg',title:'Triple Self-Portrait Dog',after:'after Norman Rockwell',album:'Modern Moods'},
 {id:'relativity',file:'v7/art/98_escher_hamsters_stairs.jpg',title:'Relativity Hamsters',after:'after M. C. Escher',album:'Modern Moods'},
 {id:'walk',file:'v7/art/99_sorolla_cats_beach.jpg',title:'Walk on the Beach Cats',after:'after Joaquin Sorolla',album:'Salon de Paris'},
 {id:'flowers',file:'v7/art/100_rivera_armadillo_flowers.jpg',title:'The Flower Carrier',after:'after Diego Rivera',album:'Far Horizons'},
 {id:'galilee',file:'v7/art/101_rembrandt_otters_storm.jpg',title:'The Storm on the Sea of Otters',after:'after Rembrandt',album:'Old Masters'},
 {id:'delaware',file:'v7/art/102_leutze_beavers_delaware.jpg',title:'Beavers Crossing the Delaware',after:'after Emanuel Leutze',album:'Grand Gallery'},
 {id:'asnieres',file:'v7/art/103_seurat_capybaras_bathers.jpg',title:'Capybaras at Asnieres',after:'after Georges Seurat',album:'Salon de Paris'},
 {id:'boating',file:'v7/art/104_renoir_dogs_boating_party.jpg',title:'Luncheon of the Boating Dogs',after:'after Pierre-Auguste Renoir',album:'Salon de Paris'},
 {id:'dream',file:'v7/art/105_rousseau_sloth_dream.jpg',title:'The Dream of the Sloth',after:'after Henri Rousseau',album:'Modern Moods'},
 {id:'bedroom',file:'v7/art/106_vangogh_cat_bedroom.jpg',title:'The Bedroom of the Cat',after:'after Vincent van Gogh',album:'Impressionist Garden'},
 {id:'supper',file:'v7/art/107_leonardo_penguins_supper.jpg',title:'The Last Supper of the Penguins',after:'after Leonardo da Vinci',album:'Old Masters'},
 {id:'athens',file:'v7/art/108_raphael_owls_athens.jpg',title:'The School of Owls',after:'after Raphael',album:'Old Masters'},
 {id:'urbino',file:'v7/art/109_titian_cat_urbino.jpg',title:'The Cat of Urbino',after:'after Titian',album:'Old Masters'},
 {id:'pinkie',file:'v7/art/110_lawrence_lamb_pinkie.jpg',title:'Pinkie the Lamb',after:'after Thomas Lawrence',album:'Grand Gallery'},
 {id:'june',file:'v7/art/111_leighton_cat_flaming_june.jpg',title:'Flaming June Cat',after:'after Frederic Leighton',album:'Grand Gallery'},
 {id:'proserpine',file:'v7/art/112_rossetti_fox_proserpine.jpg',title:'Proserpine Fox',after:'after Dante Gabriel Rossetti',album:'Grand Gallery'},
 {id:'montmartre',file:'v7/art/113_pissarro_pigeons_boulevard.jpg',title:'Boulevard Montmartre Pigeons',after:'after Camille Pissarro',album:'Salon de Paris'},
 {id:'haystacks',file:'v7/art/114_monet_sheep_haystacks.jpg',title:'Haystacks with Sheep',after:'after Claude Monet',album:'Impressionist Garden'},
 {id:'rhone',file:'v7/art/115_vangogh_otters_rhone.jpg',title:'Starry Night over the Rhone Otters',after:'after Vincent van Gogh',album:'Impressionist Garden'},
 {id:'poker',file:'v7/art/116_coolidge_cats_poker.jpg',title:'Cats Playing Poker',after:'after Cassius Coolidge',album:'Modern Moods'},
 {id:'thanks',file:'v7/art/117_rockwell_bears_thanksgiving.jpg',title:'Freedom from Want Bears',after:'after Norman Rockwell',album:'Modern Moods'},
 {id:'steam',file:'v7/art/118_turner_hare_steam.jpg',title:'Rain, Steam and Speed Hare',after:'after J. M. W. Turner',album:'Grand Tour'},
 {id:'cliffs',file:'v7/art/119_friedrich_goats_cliffs.jpg',title:'Chalk Cliffs with Goats',after:'after Caspar David Friedrich',album:'Grand Tour'},
 {id:'oath',file:'v7/art/120_david_roosters_oath.jpg',title:'The Oath of the Roosters',after:'after Jacques-Louis David',album:'Grand Gallery'},
 {id:'luncheon',file:'v7/art/121_manet_geese_luncheon.jpg',title:'Luncheon on the Grass Geese',after:'after Edouard Manet',album:'Salon de Paris'},
 {id:'watering',file:'v7/art/122_renoir_kitten_watering_can.jpg',title:'Kitten with a Watering Can',after:'after Pierre-Auguste Renoir',album:'Salon de Paris'},
 {id:'victoire',file:'v7/art/123_cezanne_marmots_victoire.jpg',title:'Mont Sainte-Victoire with Marmots',after:'after Paul Cezanne',album:'Impressionist Garden'},
 {id:'apples',file:'v7/art/124_cezanne_mouse_apples.jpg',title:'Still Life with Apples and a Mouse',after:'after Paul Cezanne',album:'Impressionist Garden'},
 {id:'cassatt',file:'v7/art/125_cassatt_ducks_boating.jpg',title:'The Boating Party Ducks',after:'after Mary Cassatt',album:'Salon de Paris'},
 {id:'harvest',file:'v7/art/126_bruegel_hamsters_harvesters.jpg',title:'The Hamster Harvesters',after:'after Pieter Bruegel',album:'Old Masters'},
 {id:'kahlo',file:'v7/art/127_kahlo_cat_hummingbird.jpg',title:'Self-Portrait Cat with Hummingbird',after:'after Frida Kahlo',album:'Modern Moods'},
 {id:'skaters',file:'v7/art/128_avercamp_penguins_skaters.jpg',title:'Winter Landscape with Skating Penguins',after:'after Hendrick Avercamp',album:'Old Masters'},
 {id:'budgie',file:'v7/art/129_fabritius_budgie_goldfinch.jpg',title:'The Goldfinch Budgie',after:'after Carel Fabritius',album:'Old Masters'},
 {id:'cavalier',file:'v7/art/130_hals_cat_laughing_cavalier.jpg',title:'The Laughing Cavalier Cat',after:'after Frans Hals',album:'Old Masters'},
 {id:'haulers',file:'v7/art/131_repin_bears_barge_haulers.jpg',title:'Bear Barge Haulers',after:'after Ilya Repin',album:'Grand Tour'},
 {id:'peaches',file:'v7/art/132_serov_kitten_peaches.jpg',title:'Kitten with Peaches',after:'after Valentin Serov',album:'Far Horizons'},
 {id:'autumn',file:'v7/art/133_levitan_fox_golden_autumn.jpg',title:'Golden Autumn Fox',after:'after Isaac Levitan',album:'Far Horizons'},
 {id:'tsarevich',file:'v7/art/134_vasnetsov_kitten_grey_wolf.jpg',title:'Kitten on the Grey Wolf',after:'after Viktor Vasnetsov',album:'Far Horizons'},
 {id:'sunday',file:'v7/art/135_hopper_cats_early_sunday.jpg',title:'Early Sunday Morning Cats',after:'after Edward Hopper',album:'Modern Moods'},
 {id:'magpie',file:'v7/art/136_monet_cat_magpie.jpg',title:'The Magpie Cat',after:'after Claude Monet',album:'Impressionist Garden'},
 {id:'nightmare',file:'v7/art/137_fuseli_pug_nightmare.jpg',title:'The Nightmare Pug',after:'after Henry Fuseli',album:'Grand Gallery'},
 {id:'hylas',file:'v7/art/138_waterhouse_fox_frogs_hylas.jpg',title:'Fox and the Frog Nymphs',after:'after John William Waterhouse',album:'Grand Tour'},
 {id:'bluecats',file:'v7/art/139_marc_blue_cats.jpg',title:'The Large Blue Cats',after:'after Franz Marc',album:'Modern Moods'},
 {id:'monarch',file:'v7/art/140_landseer_goat_monarch.jpg',title:'Monarch of the Glen Goat',after:'after Edwin Landseer',album:'Grand Tour'},
 {id:'whistlejacket',file:'v7/art/141_stubbs_corgi_whistlejacket.jpg',title:'Whistlejacket Corgi',after:'after George Stubbs',album:'Grand Tour'},
 {id:'madamex',file:'v7/art/142_sargent_cat_madame_x.jpg',title:'Portrait of Madame Cat X',after:'after John Singer Sargent',album:'Grand Tour'},
 {id:'lanterns',file:'v7/art/143_sargent_bunnies_lanterns.jpg',title:'Carnation, Lily, Lily, Bunny',after:'after John Singer Sargent',album:'Impressionist Garden'},
 {id:'gulf',file:'v7/art/144_homer_cat_gulf_stream.jpg',title:'The Gulf Stream Cat',after:'after Winslow Homer',album:'Far Horizons'},
 {id:'whip',file:'v7/art/145_homer_puppies_snap_whip.jpg',title:'Snap the Whip Puppies',after:'after Winslow Homer',album:'Far Horizons'},
 {id:'plum',file:'v7/art/146_hiroshige_red_panda_plum.jpg',title:'Plum Garden Red Panda',after:'after Utagawa Hiroshige',album:'Far Horizons'},
 {id:'bouquet',file:'v7/art/147_ruysch_mouse_bouquet.jpg',title:'Flower Still Life with Mouse',after:'after Rachel Ruysch',album:'Old Masters'},
 {id:'fireplace',file:'v7/art/148_magritte_mouse_fireplace.jpg',title:'Time Transfixed Mouse',after:'after Rene Magritte',album:'Modern Moods'},
 {id:'unicorn',file:'v7/art/149_tapestry_cat_unicorn.jpg',title:'The Cat and the Unicorn',after:'after The Lady and the Unicorn tapestry',album:'Grand Gallery'},
 {id:'icebergs',file:'v7/art/150_church_polar_bears_icebergs.jpg',title:'The Icebergs with Polar Bears',after:'after Frederic Edwin Church',album:'Far Horizons'},
 {id:'letter',file:'v7/art/151_vermeer_bunny_letter.jpg',title:'Bunny Reading a Letter',after:'after Johannes Vermeer',album:'Old Masters'},
 {id:'icarus',file:'v7/art/152_bruegel_squirrel_icarus.jpg',title:'Landscape with the Fall of a Flying Squirrel',after:'after Pieter Bruegel',album:'Grand Tour'},
 {id:'circus',file:'v7/art/153_seurat_poodles_circus.jpg',title:'The Circus Poodles',after:'after Georges Seurat',album:'Salon de Paris'},
 {id:'tahiti',file:'v7/art/154_gauguin_parrots_tahiti.jpg',title:'Tahitian Parrots on the Beach',after:'after Paul Gauguin',album:'Far Horizons'},
 {id:'stairs',file:'v7/art/155_burnejones_birds_golden_stairs.jpg',title:'The Golden Stairs of the Birds',after:'after Edward Burne-Jones',album:'Grand Gallery'},
 {id:'lighthouse',file:'v7/art/156_hopper_cats_lighthouse.jpg',title:'Lighthouse Cats at Two Lights',after:'after Edward Hopper',album:'Modern Moods'},
 {id:'irises',file:'v7/art/157_vangogh_kitten_irises.jpg',title:'Irises with a Kitten',after:'after Vincent van Gogh',album:'Impressionist Garden'},
 {id:'prodigal',file:'v7/art/158_rembrandt_puppy_prodigal.jpg',title:'The Return of the Prodigal Puppy',after:'after Rembrandt',album:'Old Masters'},
 {id:'canal',file:'v7/art/159_canaletto_otters_grand_canal.jpg',title:'Grand Canal of the Gondolier Otters',after:'after Canaletto',album:'Grand Tour'},
 {id:'lazare',file:'v7/art/160_monet_pigeons_gare_saint_lazare.jpg',title:'Gare Saint-Lazare with Pigeons',after:'after Claude Monet',album:'Salon de Paris'},
 {id:'empire',file:'v7/art/161_magritte_cat_empire_of_light.jpg',title:'Empire of Light Cat',after:'after Rene Magritte',album:'Modern Moods'},
 {id:'rooks',file:'v7/art/162_savrasov_ducks_rooks.jpg',title:'The Ducks Have Returned',after:'after Alexei Savrasov',album:'Far Horizons'},
 {id:'lizard',file:'v7/art/163_caravaggio_kitten_lizard.jpg',title:'Kitten Bitten by a Lizard',after:'after Caravaggio',album:'Old Masters'},
 {id:'flood',file:'v7/art/164_sisley_ducks_flood.jpg',title:'Flood at Port-Marly with Ducks',after:'after Alfred Sisley',album:'Impressionist Garden'},
 {id:'odalisque',file:'v7/art/165_ingres_cat_odalisque.jpg',title:'The Grand Odalisque Cat',after:'after Jean-Auguste-Dominique Ingres',album:'Grand Gallery'},
 {id:'village',file:'v7/art/166_chagall_cat_village.jpg',title:'I and the Village Cat',after:'after Marc Chagall',album:'Modern Moods'},
 {id:'bougival',file:'v7/art/167_renoir_bears_bougival.jpg',title:'Dance at Bougival Bears',after:'after Pierre-Auguste Renoir',album:'Salon de Paris'},
 {id:'duke',file:'v7/art/168_piero_hamster_duke.jpg',title:'The Duke Hamster of Urbino',after:'after Piero della Francesca',album:'Old Masters'},
 {id:'toledo',file:'v7/art/169_elgreco_cats_toledo.jpg',title:'View of Toledo with Cats',after:'after El Greco',album:'Grand Tour'},
 {id:'swan',file:'v7/art/170_vrubel_goose_swan_princess.jpg',title:'The Swan Princess Goose',after:'after Mikhail Vrubel',album:'Far Horizons'},
 {id:'gas',file:'v7/art/171_hopper_raccoon_gas.jpg',title:'Gas Station Raccoon',after:'after Edward Hopper',album:'Modern Moods'},
 {id:'cypress',file:'v7/art/172_vangogh_sheep_cypresses.jpg',title:'Wheatfield with Cypresses and Sheep',after:'after Vincent van Gogh',album:'Impressionist Garden'},
 {id:'fifer',file:'v7/art/173_manet_penguin_fifer.jpg',title:'The Fifer Penguin',after:'after Edouard Manet',album:'Salon de Paris'},
 {id:'roses',file:'v7/art/174_almatadema_cats_roses.jpg',title:'The Roses of the Cats',after:'after Lawrence Alma-Tadema',album:'Grand Gallery'},
 {id:'hunters',file:'v7/art/175_perov_dogs_hunters_rest.jpg',title:'Hunter Dogs at Rest',after:'after Vasily Perov',album:'Far Horizons'},
 {id:'eggs',file:'v7/art/176_velazquez_hen_frying_eggs.jpg',title:'Old Hen Frying Eggs',after:'after Diego Velazquez',album:'Old Masters'},
 {id:'louveciennes',file:'v7/art/177_sisley_cat_snow_louveciennes.jpg',title:'Snow at Louveciennes with a Cat',after:'after Alfred Sisley',album:'Impressionist Garden'},
 {id:'desperate',file:'v7/art/178_courbet_cat_desperate.jpg',title:'The Desperate Cat',after:'after Gustave Courbet',album:'Salon de Paris'},
 {id:'throne',file:'v7/art/179_ingres_pug_throne.jpg',title:'Emperor Pug on his Throne',after:'after Jean-Auguste-Dominique Ingres',album:'Grand Gallery'},
 {id:'tempest',file:'v7/art/180_giorgione_otter_tempest.jpg',title:'The Tempest Otter',after:'after Giorgione',album:'Grand Tour'},
 {id:'yellowcow',file:'v7/art/181_marc_yellow_cow_bunny.jpg',title:'The Yellow Cow and the Bunny',after:'after Franz Marc',album:'Modern Moods'},
 {id:'seaport',file:'v7/art/182_lorrain_seals_seaport.jpg',title:'Seaport with Seal Merchants',after:'after Claude Lorrain',album:'Grand Tour'},
 {id:'applepick',file:'v7/art/183_pissarro_hedgehogs_apple_harvest.jpg',title:'Apple Harvest Hedgehogs',after:'after Camille Pissarro',album:'Impressionist Garden'},
 {id:'racehorses',file:'v7/art/184_degas_corgis_racehorses.jpg',title:'Racehorse Corgis before the Start',after:'after Edgar Degas',album:'Salon de Paris'},
 {id:'strawhat',file:'v7/art/185_vigee_fox_straw_hat.jpg',title:'Self-Portrait Fox in a Straw Hat',after:'after Elisabeth Vigee Le Brun',album:'Grand Gallery'},
 {id:'kanbara',file:'v7/art/186_hiroshige_foxes_night_snow.jpg',title:'Night Snow with Foxes',after:'after Utagawa Hiroshige',album:'Far Horizons'},
 {id:'merry',file:'v7/art/187_steen_pigs_merry_family.jpg',title:'The Merry Pig Family',after:'after Jan Steen',album:'Old Masters'},
 {id:'football',file:'v7/art/188_rousseau_bunnies_football.jpg',title:'The Football Bunnies',after:'after Henri Rousseau',album:'Modern Moods'},
 {id:'summer',file:'v7/art/189_morisot_ducks_summers_day.jpg',title:'Summer\'s Day Ducks',after:'after Berthe Morisot',album:'Impressionist Garden'},
 {id:'charles',file:'v7/art/190_vandyck_corgi_king_hunt.jpg',title:'King Corgi at the Hunt',after:'after Anthony van Dyck',album:'Grand Gallery'},
 {id:'delft',file:'v7/art/191_vermeer_ducks_view_of_delft.jpg',title:'View of Delft with Ducks',after:'after Johannes Vermeer',album:'Grand Tour'},
 {id:'tiger',file:'v7/art/192_minhwa_tiger_magpie.jpg',title:'Tiger and Magpie',after:'after Korean minhwa folk painting',album:'Far Horizons'},
 {id:'lacemaker',file:'v7/art/193_vermeer_mouse_lacemaker.jpg',title:'The Lacemaker Mouse',after:'after Johannes Vermeer',album:'Old Masters'},
 {id:'sierra',file:'v7/art/194_bierstadt_bears_sierra.jpg',title:'Among the Sierra Nevada Bears',after:'after Albert Bierstadt',album:'Far Horizons'},
 {id:'runaway',file:'v7/art/195_rockwell_puppy_runaway.jpg',title:'The Runaway Puppy',after:'after Norman Rockwell',album:'Modern Moods'},
 {id:'bacchus',file:'v7/art/196_titian_cats_bacchus_ariadne.jpg',title:'Bacchus and Ariadne Cats',after:'after Titian',album:'Old Masters'},
 {id:'oxbow',file:'v7/art/197_cole_beaver_oxbow.jpg',title:'The Oxbow with a Beaver',after:'after Thomas Cole',album:'Grand Tour'},
 {id:'giverny',file:'v7/art/198_monet_cats_garden_path.jpg',title:'Garden Path with Cats',after:'after Claude Monet',album:'Impressionist Garden'},
 {id:'innocence',file:'v7/art/199_reynolds_lamb_innocence.jpg',title:'The Age of Innocence Lamb',after:'after Joshua Reynolds',album:'Grand Gallery'},
 {id:'annunciation',file:'v7/art/200_leonardo_capybara_annunciation.jpg',title:'The Capybara Annunciation',after:'after Leonardo da Vinci',album:'Old Masters'},
 {id:'littlestreet',file:'v7/art/201_vermeer_cats_little_street.jpg',title:'The Little Street of Cats',after:'after Johannes Vermeer',album:'Old Masters'},
 {id:'courtyard',file:'v7/art/202_dehooch_mice_courtyard.jpg',title:'Courtyard of the Mice',after:'after Pieter de Hooch',album:'Old Masters'},
 {id:'yellowhouse',file:'v7/art/203_vangogh_fox_yellow_house.jpg',title:'The Yellow House Fox',after:'after Vincent van Gogh',album:'Impressionist Garden'},
 {id:'roulin',file:'v7/art/204_vangogh_bear_postman.jpg',title:'The Postman Bear',after:'after Vincent van Gogh',album:'Impressionist Garden'},
 {id:'trouville',file:'v7/art/205_monet_cats_trouville.jpg',title:'The Beach at Trouville Cats',after:'after Claude Monet',album:'Impressionist Garden'},
 {id:'renoirswing',file:'v7/art/206_renoir_rabbits_swing.jpg',title:'The Rabbit on the Swing',after:'after Pierre-Auguste Renoir',album:'Salon de Paris'},
 {id:'star',file:'v7/art/207_degas_flamingo_star.jpg',title:'The Star Ballerina',after:'after Edgar Degas',album:'Salon de Paris'},
 {id:'arearea',file:'v7/art/208_gauguin_parrots_arearea.jpg',title:'Arearea Parrots',after:'after Paul Gauguin',album:'Far Horizons'},
 {id:'railway',file:'v7/art/209_manet_cat_railway.jpg',title:'The Railway Cat',after:'after Edouard Manet',album:'Salon de Paris'},
 {id:'scrapers',file:'v7/art/210_caillebotte_beavers_floor.jpg',title:'The Floor Scraping Beavers',after:'after Gustave Caillebotte',album:'Salon de Paris'},
 {id:'cancale',file:'v7/art/211_sargent_otters_oysters.jpg',title:'Oyster Gatherers of Cancale',after:'after John Singer Sargent',album:'Grand Tour'},
 {id:'breezing',file:'v7/art/212_homer_puppies_breezing.jpg',title:'Breezing Up Puppies',after:'after Winslow Homer',album:'Far Horizons'},
 {id:'rosie',file:'v7/art/213_rockwell_hen_rosie.jpg',title:'Rosie the Riveter Hen',after:'after Norman Rockwell',album:'Modern Moods'},
 {id:'harmony',file:'v7/art/214_matisse_cat_harmony_red.jpg',title:'Harmony in Red Cat',after:'after Henri Matisse',album:'Modern Moods'},
 {id:'musicians',file:'v7/art/215_picasso_animals_three_musicians.jpg',title:'Three Musician Animals',after:'after Pablo Picasso',album:'Modern Moods'},
 {id:'ejiri',file:'v7/art/216_hokusai_rabbits_ejiri.jpg',title:'Windy Day at Ejiri Rabbits',after:'after Katsushika Hokusai',album:'Far Horizons'},
 {id:'artofpainting',file:'v7/art/217_vermeer_fox_art_of_painting.jpg',title:'The Art of Painting Fox',after:'after Johannes Vermeer',album:'Old Masters'},
 {id:'spinners',file:'v7/art/218_velazquez_mice_spinners.jpg',title:'The Mouse Spinners',after:'after Diego Velazquez',album:'Grand Gallery'},
 {id:'snowstorm',file:'v7/art/219_goya_animals_snowstorm.jpg',title:'The Snowstorm Travellers',after:'after Francisco Goya',album:'Grand Gallery'},
 {id:'melon',file:'v7/art/220_murillo_raccoons_grapes_melon.jpg',title:'Raccoons Eating Grapes and Melon',after:'after Bartolome Esteban Murillo',album:'Grand Gallery'},
 {id:'grace',file:'v7/art/221_chardin_mice_grace.jpg',title:'Grace before the Meal Mice',after:'after Jean-Simeon Chardin',album:'Grand Gallery'},
 {id:'salisbury',file:'v7/art/222_constable_geese_salisbury.jpg',title:'Salisbury Cathedral with Geese',after:'after John Constable',album:'Grand Tour'},
 {id:'blindgirl',file:'v7/art/223_millais_dogs_rainbow.jpg',title:'The Rainbow Dogs',after:'after John Everett Millais',album:'Grand Gallery'},
 {id:'nutgatherers',file:'v7/art/224_bouguereau_squirrels_nuts.jpg',title:'The Nut Gathering Squirrels',after:'after William-Adolphe Bouguereau',album:'Grand Gallery'},
 {id:'bonjour',file:'v7/art/225_courbet_fox_bonjour.jpg',title:'Bonjour Monsieur Fox',after:'after Gustave Courbet',album:'Salon de Paris'},
 {id:'sower',file:'v7/art/226_millet_bear_sower.jpg',title:'The Sower Bear',after:'after Jean-Francois Millet',album:'Impressionist Garden'},
 {id:'lark',file:'v7/art/227_breton_hen_lark.jpg',title:'The Song of the Lark Hen',after:'after Jules Breton',album:'Impressionist Garden'},
 {id:'cossacks',file:'v7/art/228_repin_animals_cossacks_letter.jpg',title:'The Laughing Letter Writers',after:'after Ilya Repin',album:'Far Horizons'},
 {id:'horsewoman',file:'v7/art/229_bryullov_fox_horsewoman.jpg',title:'The Fox Horsewoman',after:'after Karl Bryullov',album:'Far Horizons'},
 {id:'rhino',file:'v7/art/230_durer_rhinoceros.jpg',title:'The Armoured Rhinoceros',after:'after Albrecht Durer',album:'Old Masters'},
 {id:'fortune',file:'v7/art/231_caravaggio_fox_fortune.jpg',title:'The Fortune Teller Fox',after:'after Caravaggio',album:'Old Masters'},
 {id:'stgeorge',file:'v7/art/232_uccello_mouse_dragon.jpg',title:'Saint Mouse and the Dragon',after:'after Paolo Uccello',album:'Old Masters'},
 {id:'mortefontaine',file:'v7/art/233_corot_deer_mortefontaine.jpg',title:'Souvenir with Fawns',after:'after Jean-Baptiste-Camille Corot',album:'Impressionist Garden'},
 {id:'thirdclass',file:'v7/art/234_daumier_animals_train.jpg',title:'The Third-Class Carriage',after:'after Honore Daumier',album:'Salon de Paris'},
 {id:'birch',file:'v7/art/235_larsson_family_breakfast.jpg',title:'Breakfast under the Big Birch',after:'after Carl Larsson',album:'Far Horizons'},
 {id:'skagen',file:'v7/art/236_kroyer_cats_skagen.jpg',title:'Summer Evening at Skagen',after:'after Peder Severin Kroyer',album:'Far Horizons'},
 {id:'revere',file:'v7/art/237_wood_fox_midnight_ride.jpg',title:'The Midnight Ride of the Fox',after:'after Grant Wood',album:'Modern Moods'},
 {id:'middelharnis',file:'v7/art/238_hobbema_hunter_avenue.jpg',title:'The Avenue with a Hunting Dog',after:'after Meindert Hobbema',album:'Grand Tour'},
 {id:'windmill',file:'v7/art/239_ruisdael_windmill.jpg',title:'The Windmill with Ducks',after:'after Jacob van Ruisdael',album:'Old Masters'},
 {id:'arcadia',file:'v7/art/240_poussin_shepherds_arcadia.jpg',title:'The Shepherds of Arcadia',after:'after Nicolas Poussin',album:'Old Masters'},
 {id:'liverpool',file:'v7/art/241_grimshaw_cats_quay.jpg',title:'Moonlit Quay with Cats',after:'after John Atkinson Grimshaw',album:'Grand Tour'},
 {id:'holyday',file:'v7/art/242_tissot_picnic.jpg',title:'Holiday Picnic by the Pond',after:'after James Tissot',album:'Salon de Paris'},
 {id:'tuvstarr',file:'v7/art/243_bauer_mouse_princess_pond.jpg',title:'The Little Princess at the Forest Pond',after:'after John Bauer',album:'Far Horizons'},
 {id:'birchgrove',file:'v7/art/244_kuindzhi_fox_birch_grove.jpg',title:'The Birch Grove Fox',after:'after Arkhip Kuindzhi',album:'Far Horizons'},
 {id:'moscowyard',file:'v7/art/245_polenov_moscow_courtyard.jpg',title:'Courtyard with Puppies',after:'after Vasily Polenov',album:'Far Horizons'},
 {id:'major',file:'v7/art/246_fedotov_pig_proposal.jpg',title:'The Major\'s Proposal Pig',after:'after Pavel Fedotov',album:'Far Horizons'},
 {id:'alyonushka',file:'v7/art/247_vasnetsov_doe_alyonushka.jpg',title:'Alyonushka the Doe',after:'after Viktor Vasnetsov',album:'Far Horizons'},
 {id:'nightcafe2',file:'v7/art/248_vangogh_billiard_night_cafe.jpg',title:'The Night Café with Billiards',after:'after Vincent van Gogh',album:'Impressionist Garden'},
 {id:'fireworks',file:'v7/art/249_hiroshige_fireworks.jpg',title:'Fireworks over the Bridge',after:'after Utagawa Hiroshige',album:'Far Horizons'},
 {id:'bookworm',file:'v7/art/250_spitzweg_mouse_bookworm.jpg',title:'The Bookworm Mouse',after:'after Carl Spitzweg',album:'Old Masters'},
 {id:'chocolate',file:'v7/art/251_liotard_mouse_chocolate.jpg',title:'The Chocolate Mouse',after:'after Jean-Etienne Liotard',album:'Salon de Paris'},
 {id:'reader',file:'v7/art/252_fragonard_cat_reader.jpg',title:'The Young Reader Cat',after:'after Jean-Honore Fragonard',album:'Salon de Paris'},
 {id:'pompadour',file:'v7/art/253_boucher_cat_pompadour.jpg',title:'Madame Pompadour Cat',after:'after Francois Boucher',album:'Salon de Paris'},
 {id:'regatta',file:'v7/art/254_monet_ducks_regatta.jpg',title:'Regatta of the Ducks',after:'after Claude Monet',album:'Impressionist Garden'},
 {id:'piano',file:'v7/art/255_renoir_kittens_piano.jpg',title:'Kittens at the Piano',after:'after Pierre-Auguste Renoir',album:'Impressionist Garden'},
 {id:'orchestra',file:'v7/art/256_degas_animal_orchestra.jpg',title:'The Orchestra of the Opera',after:'after Edgar Degas',album:'Salon de Paris'},
 {id:'armchair',file:'v7/art/257_cassatt_puppy_armchair.jpg',title:'Puppy in the Blue Armchair',after:'after Mary Cassatt',album:'Impressionist Garden'},
 {id:'europebridge',file:'v7/art/258_caillebotte_dogs_europe_bridge.jpg',title:'The Europe Bridge Dogs',after:'after Gustave Caillebotte',album:'Salon de Paris'},
 {id:'flowersfruit',file:'v7/art/259_fantinlatour_hamster_still_life.jpg',title:'Flowers, Fruit and a Hamster',after:'after Henri Fantin-Latour',album:'Salon de Paris'},
 {id:'sainttropez',file:'v7/art/260_signac_seagulls_harbour.jpg',title:'Harbour of the Seagulls',after:'after Paul Signac',album:'Modern Moods'},
 {id:'tigerstorm',file:'v7/art/261_rousseau_tiger_storm.jpg',title:'Tiger Cub in a Storm',after:'after Henri Rousseau',album:'Far Horizons'},
 {id:'snakecharmer',file:'v7/art/262_rousseau_meerkat_snake_charmer.jpg',title:'The Meerkat Snake Charmer',after:'after Henri Rousseau',album:'Far Horizons'},
 {id:'sunflowergarden',file:'v7/art/263_klimt_hedgehog_sunflowers.jpg',title:'Farm Garden with Sunflowers',after:'after Gustav Klimt',album:'Modern Moods'},
 {id:'flyingbirthday',file:'v7/art/264_chagall_cat_birthday.jpg',title:'The Flying Birthday',after:'after Marc Chagall',album:'Modern Moods'},
 {id:'openwindow',file:'v7/art/265_matisse_cat_open_window.jpg',title:'The Open Window Cat',after:'after Henri Matisse',album:'Modern Moods'},
 {id:'saltimbanques',file:'v7/art/266_picasso_circus_animal_family.jpg',title:'The Circus Family',after:'after Pablo Picasso',album:'Modern Moods'},
 {id:'giraffelady',file:'v7/art/267_modigliani_giraffe_lady.jpg',title:'The Long-necked Lady',after:'after Amedeo Modigliani',album:'Modern Moods'},
 {id:'chopsuey',file:'v7/art/268_hopper_cats_chop_suey.jpg',title:'The Chop Suey Cats',after:'after Edward Hopper',album:'Grand Tour'},
 {id:'newyorkmovie',file:'v7/art/269_hopper_fox_movie_theatre.jpg',title:'The Fox Usherette',after:'after Edward Hopper',album:'Grand Tour'},
 {id:'barbershop',file:'v7/art/270_rockwell_animal_barbershop.jpg',title:'The Barbershop Band',after:'after Norman Rockwell',album:'Grand Tour'},
 {id:'threshers',file:'v7/art/271_grantwood_dinner_threshers.jpg',title:'Dinner for the Threshers',after:'after Grant Wood',album:'Grand Tour'},
 {id:'fogwarning',file:'v7/art/272_homer_seal_fog_warning.jpg',title:'The Fog Warning',after:'after Winslow Homer',album:'Far Horizons'},
 {id:'scull',file:'v7/art/273_eakins_otter_scull.jpg',title:'The Otter in the Single Scull',after:'after Thomas Eakins',album:'Grand Tour'},
 {id:'furtraders',file:'v7/art/274_bingham_fox_fur_traders.jpg',title:'The River Traders',after:'after George Caleb Bingham',album:'Grand Tour'},
 {id:'fiveoclock',file:'v7/art/275_cassatt_hens_five_oclock_tea.jpg',title:'Five O\'Clock Tea Hens',after:'after Mary Cassatt',album:'Impressionist Garden'},
 {id:'yellowstone',file:'v7/art/276_moran_elk_canyon.jpg',title:'Elk at the Grand Canyon',after:'after Thomas Moran',album:'Far Horizons'},
 {id:'kirifuri',file:'v7/art/277_hokusai_monkeys_waterfall.jpg',title:'Monkeys at the Kirifuri Waterfall',after:'after Katsushika Hokusai',album:'Far Horizons'},
 {id:'roosters',file:'v7/art/278_jakuchu_roosters_garden.jpg',title:'The Rooster Garden',after:'after Ito Jakuchu',album:'Far Horizons'},
 {id:'qingming',file:'v7/art/279_qingming_animal_river_market.jpg',title:'The River Festival',after:'after Zhang Zeduan',album:'Far Horizons'},
 {id:'march',file:'v7/art/280_levitan_horse_march.jpg',title:'March Sunshine',after:'after Isaac Levitan',album:'Far Horizons'},
 {id:'ploughing',file:'v7/art/281_venetsianov_bunny_ploughing.jpg',title:'Spring Ploughing',after:'after Alexey Venetsianov',album:'Far Horizons'},
 {id:'maslenitsa',file:'v7/art/282_kustodiev_animals_maslenitsa.jpg',title:'The Pancake Fair',after:'after Boris Kustodiev',album:'Far Horizons'},
 {id:'dressingtable',file:'v7/art/283_serebriakova_cat_dressing_table.jpg',title:'At the Dressing Table',after:'after Zinaida Serebriakova',album:'Far Horizons'},
 {id:'redhorse',file:'v7/art/284_petrovvodkin_hare_red_horse.jpg',title:'Bathing of a Red Horse',after:'after Kuzma Petrov-Vodkin',album:'Modern Moods'},
 {id:'lowmarks',file:'v7/art/285_reshetnikov_puppy_low_marks.jpg',title:'Low Marks Again',after:'after Fyodor Reshetnikov',album:'Modern Moods'},
 {id:'snowfortress',file:'v7/art/286_surikov_animals_snow_fortress.jpg',title:'Taking the Snow Fortress',after:'after Vasily Surikov',album:'Far Horizons'},
 {id:'sadko',file:'v7/art/287_repin_otter_sadko.jpg',title:'Sadko in the Underwater Kingdom',after:'after Ilya Repin',album:'Far Horizons'},
 {id:'blindmansbuff',file:'v7/art/288_goya_blind_mans_buff.jpg',title:'Blind Man\'s Buff',after:'after Francisco Goya',album:'Grand Gallery'},
 {id:'sewingsail',file:'v7/art/289_sorolla_cats_sewing_sail.jpg',title:'Sewing the Sail',after:'after Joaquin Sorolla',album:'Grand Gallery'},
 {id:'stonemason',file:'v7/art/290_canaletto_beaver_stonemasons.jpg',title:'The Beaver Stonemasons\' Yard',after:'after Canaletto',album:'Grand Tour'},
 {id:'dancinglesson',file:'v7/art/291_longhi_hedgehog_dancing_lesson.jpg',title:'The Dancing Lesson',after:'after Pietro Longhi',album:'Grand Tour'},
 {id:'cattleriver',file:'v7/art/292_cuyp_cows_river.jpg',title:'Cows in the River',after:'after Aelbert Cuyp',album:'Old Masters'},
 {id:'youngbull',file:'v7/art/293_potter_young_bull.jpg',title:'The Young Bull',after:'after Paulus Potter',album:'Old Masters'},
 {id:'birdspark',file:'v7/art/294_hondecoeter_birds_park.jpg',title:'Birds in a Park',after:'after Melchior d\'Hondecoeter',album:'Old Masters'},
 {id:'fluteconcert',file:'v7/art/295_menzel_fox_flute_concert.jpg',title:'The Flute Concert',after:'after Adolph Menzel',album:'Old Masters'},
 {id:'poorpoet',file:'v7/art/296_spitzweg_cat_poor_poet.jpg',title:'The Poor Poet Cat',after:'after Carl Spitzweg',album:'Old Masters'},
 {id:'schreckenstein',file:'v7/art/297_richter_ferry_crossing.jpg',title:'The Ferry at Schreckenstein',after:'after Ludwig Richter',album:'Old Masters'},
 {id:'eden',file:'v7/art/298_brueghel_garden_paradise.jpg',title:'The Garden of Paradise',after:'after Jan Brueghel the Elder',album:'Old Masters'},
 {id:'horsefair',file:'v7/art/299_bonheur_horse_fair.jpg',title:'The Horse Fair',after:'after Rosa Bonheur',album:'Salon de Paris'},
 {id:'pantry',file:'v7/art/300_snyders_raccoons_pantry.jpg',title:'Raccoons in the Pantry',after:'after Frans Snyders',album:'Old Masters'},
];
/* v9: ART = 300 картин (все в v7/art); ART_V 31-100 посчитаны art_v.py по рецепту ниже (подгонка под 30 авторских, r=0.95)
   Visual difficulty V (0 = every slice is distinct, 1 = slices look alike). Measured offline (tools/art_v.py):
   0.6 x colour-histogram similarity between slices + 0.4 x how hard the true seams are to tell from random seams,
   rescaled to 0.15..0.85. Re-measure whenever art is added. */
const ART_V={mona:.15,wave:.62,starry:.33,pearl:.15,scream:.28,kiss:.62,sun:.45,venus:.30,fog:.45,fuji:.33,cafe:.43,adam:.33,sloth:.45,pugs:.60,frog:.68,glean:.68,watch:.68,snow:.62,jungle:.60,menin:.57,milk:.33,dance:.58,boat:.65,swing:.55,blue:.55,turtle:.43,shower:.55,tree:.85,almond:.80,babel:.50,goat:.24,hawks:.31,son:.15,mother:.45,alps:.32,liberty:.38,lilies:.74,galette:.67,jatte:.64,ophelia:.65,arnolfini:.40,clocks:.40,astro:.47,gypsy:.29,dancer:.27,rainy:.38,rain:.50,primavera:.62,ermine:.33,parasol:.42,cards:.54,guitar:.63,goldfish:.40,crows:.50,sunrise:.55,bubbles:.39,pierrot:.44,angelus:.43,hockney:.38,golconda:.70,pop:.41,automat:.25,sisters:.48,folies:.55,lautrec:.50,mucha:.58,adele:.53,birthday:.35,nightcafe:.23,potato:.73,rouen:.55,poppies:.48,absinthe:.57,cradle:.43,bath:.61,balcony:.35,andrews:.37,haywain:.46,monk:.55,ninth:.59,pines:.64,bogatyrs:.37,tea:.40,unknown:.22,olympia:.45,lady:.45,medusa:.47,vitruvian:.52,hare:.51,ambassadors:.54,narcissus:.61,wedding:.83,vertumnus:.36,cherubs:.21,anatomy:.58,christina:.60,triple:.35,relativity:.46,walk:.58,flowers:.36,galilee:.36,delaware:.38,asnieres:.46,boating:.56,dream:.50,bedroom:.35,supper:.48,athens:.58,urbino:.20,pinkie:.24,june:.52,proserpine:.21,montmartre:.61,haystacks:.48,rhone:.47,poker:.39,thanks:.66,steam:.30,cliffs:.24,oath:.33,luncheon:.47,watering:.55,victoire:.48,apples:.40,cassatt:.32,harvest:.57,kahlo:.33,skaters:.75,budgie:.50,cavalier:.42,haulers:.42,peaches:.47,autumn:.47,tsarevich:.48,sunday:.57,magpie:.67,nightmare:.23,hylas:.50,bluecats:.44,monarch:.30,whistlejacket:.49,madamex:.44,lanterns:.53,gulf:.42,whip:.63,plum:.59,bouquet:.45,fireplace:.40,unicorn:.63,icebergs:.39,letter:.28,icarus:.43,circus:.56,tahiti:.36,stairs:.47,lighthouse:.28,irises:.64,prodigal:.53,canal:.40,lazare:.44,empire:.40,rooks:.69,lizard:.49,flood:.54,odalisque:.40,village:.42,bougival:.44,duke:.15,toledo:.47,swan:.48,gas:.35,cypress:.40,fifer:.38,roses:.62,hunters:.61,eggs:.54,louveciennes:.56,desperate:.36,throne:.59,tempest:.48,yellowcow:.49,seaport:.52,applepick:.65,racehorses:.36,strawhat:.34,kanbara:.52,merry:.66,football:.47,summer:.53,charles:.34,delft:.39,tiger:.56,lacemaker:.48,sierra:.30,runaway:.51,bacchus:.44,oxbow:.32,giverny:.60,innocence:.59,annunciation:.54,littlestreet:.55,courtyard:.63,yellowhouse:.61,roulin:.42,trouville:.55,renoirswing:.62,star:.33,arearea:.50,railway:.47,scrapers:.46,cancale:.51,breezing:.44,rosie:.57,harmony:.42,musicians:.55,ejiri:.67,artofpainting:.62,spinners:.74,snowstorm:.55,melon:.59,grace:.55,salisbury:.52,blindgirl:.47,nutgatherers:.64,bonjour:.53,sower:.60,lark:.55,cossacks:.72,horsewoman:.48,rhino:.44,fortune:.65,stgeorge:.51,mortefontaine:.49,thirdclass:.49,birch:.65,skagen:.36,revere:.53,middelharnis:.55,windmill:.40,arcadia:.63,liverpool:.55,holyday:.68,tuvstarr:.60,birchgrove:.62,moscowyard:.65,major:.57,alyonushka:.59,nightcafe2:.57,fireworks:.51,bookworm:.69,chocolate:.56,reader:.45,pompadour:.58,regatta:.54,piano:.57,orchestra:.49,armchair:.60,europebridge:.53,flowersfruit:.54,sainttropez:.62,tigerstorm:.49,snakecharmer:.52,sunflowergarden:.67,flyingbirthday:.44,openwindow:.31,saltimbanques:.79,giraffelady:.62,chopsuey:.58,newyorkmovie:.36,barbershop:.50,threshers:.59,fogwarning:.39,scull:.54,furtraders:.45,fiveoclock:.58,yellowstone:.51,kirifuri:.47,roosters:.64,qingming:.62,march:.57,ploughing:.50,maslenitsa:.78,dressingtable:.46,redhorse:.47,lowmarks:.58,snowfortress:.71,sadko:.50,blindmansbuff:.59,sewingsail:.56,stonemason:.60,dancinglesson:.64,cattleriver:.59,youngbull:.55,birdspark:.61,fluteconcert:.80,poorpoet:.75,schreckenstein:.57,eden:.63,horsefair:.54,pantry:.74};
ART.forEach(a=>a.v=ART_V[a.id]??.4);

/* every collection has its own room and bookcase */
const THEMES={
 'Old Masters':        {bg:'v7/ui/home_bg.jpg',     cls:'th-walnut', sw:'#A2652F'},
 'Modern Moods':       {bg:'v7/ui/bg_modern.jpg',   cls:'th-deco',   sw:'#1F8C86'},
 'Grand Tour':         {bg:'v7/ui/bg_tour.jpg',     cls:'th-travel', sw:'#5B3A29'},
 'Impressionist Garden':{bg:'v7/ui/bg_garden.jpg',  cls:'th-garden', sw:'#F3EEDD'},
 'Grand Gallery':      {bg:'v7/ui/bg_gallery.jpg',  cls:'th-baroque',sw:'#8E1F2B'},
 'Salon de Paris':     {bg:'v7/ui/bg_salon.jpg',    cls:'th-salon',  sw:'#F2B8C6'},
 'Far Horizons':       {bg:'v7/ui/bg_horizons.jpg', cls:'th-bamboo', sw:'#C9A35E'}};
const themeOf=(art,L)=>{const k=Object.keys(THEMES);return L?THEMES[k[Math.floor((L-1)/10)%k.length]]:(THEMES[art.album]||THEMES['Old Masters'])};
/* home-screen rooms: one library per 10 levels, a journey through eras & countries (low-detail, calm) */
const LIB_BG=[
 {bg:'v7-2/ui/lib_1_alexandria.jpg',name:'Library of Alexandria'},
 {bg:'v7-2/ui/lib_2_song.jpg',name:'Song Imperial Library'},
 {bg:'v7-2/ui/lib_3_baghdad.jpg',name:'House of Wisdom'},
 {bg:'v7-2/ui/lib_4_monastery.jpg',name:'Monastery Scriptorium'},
 {bg:'v7-2/ui/lib_5_florence.jpg',name:'Florentine Library'},
 {bg:'v7-2/ui/lib_6_baroque.jpg',name:'Baroque Abbey Library'},
 {bg:'v7-2/ui/lib_7_london.jpg',name:'Victorian Reading Room'},
 {bg:'v7-2/ui/lib_8_tokyo.jpg',name:'Modern Tokyo Library'}];
const libOf=L=>LIB_BG[Math.floor((L-1)/10)%LIB_BG.length];


/* ---------- level types ----------
   wr   = target first-attempt win rate (design hypothesis -> calibrated by sim -> recalibrated by telemetry)
   K,A  = moves economy: limit = ceil(S * K * visualAdj) + A   (S = solver moves). K/A calibrated by tools/calibrate.js
   mFrac= share of books that start out of place (the rest start home; on freeze levels they are already frozen)
   blk  = pre-glued misplaced blocks per 10 books (teach block moves, raise the "useful move" count)
   freeze: books that reach home freeze (easy & normal); hard types only get the Golden Frame on 30+ books */
const TYPES={
 E:{name:'Easy',      d:2,wr:.95,K:1.31,A:3,mFrac:.70,blk:1.2,freeze:1,reward:45},
 B:{name:'Breath',    d:3,wr:.96,K:1.28,A:3,mFrac:.62,blk:1.5,freeze:1,reward:40},
 I:{name:'New mechanic',d:3,wr:.92,K:1.07,A:3,mFrac:.75,blk:1.0,freeze:1,reward:60},
 N:{name:'Normal',    d:5,wr:.82,K:1.39,A:2,mFrac:.85,blk:.6, freeze:1,reward:60},
 M:{name:'Mini spike',d:6,wr:.65,K:1.32,A:1,mFrac:1,  blk:.3, freeze:0,reward:80},
 H:{name:'Hard',      d:8,wr:.55,K:1.17,A:1,mFrac:1,  blk:.15,freeze:0,reward:110},
 P:{name:'Peak',      d:9,wr:.42,K:1.19,A:1,mFrac:1,  blk:0,  freeze:0,reward:150}};
const HARD=t=>t==='M'||t==='H'||t==='P';

/* ---------- 10-level pattern ----------
   Hard beats (M/H/P) never touch each other; a Breath always sits right before the Peak.
   Three templates rotate by cycle so the rhythm feels alive but stays learnable. */
const PATTERNS={A:'EENMBNHNBP',B:'ENMBNEHNBP',C:'ENEMBNNHBP'};
const PATTERN_ORDER=['A','B','A','C','B','A','C','A','B','C'];
/* onboarding is hand-made: every level teaches or shows off one thing */
const ONBOARD={
 1:{t:'E',grid:[2,4],purpose:'First swap: fix two corners, the face is already there'},
 2:{t:'E',grid:[2,4],purpose:'Glued blocks: slide a 3-book block in one move'},
 3:{t:'E',grid:[2,5],purpose:'Books travel between shelves (vertical swaps)'},
 4:{t:'E',grid:[2,5],purpose:'Big-block payoff: one move places 4 books'},
 5:{t:'E',grid:[3,4],purpose:'Third shelf + Hint Lens unlock'},
 6:{t:'N',grid:[3,5],purpose:'First real sort with pre-glued blocks'},
 7:{t:'I',grid:[3,5],purpose:'Star Book: +3 moves — a positive mechanic first',mech:'stars'},
 8:{t:'B',grid:[2,6],purpose:'Breath, wide shelf, Lucky Bookmark unlock'},
 9:{t:'N',grid:[3,5],purpose:'Build-up before the first Masterpiece'},
 10:{t:'P',grid:[3,6],purpose:'First Masterpiece: soft peak, big reward',wr:.75},
};
/* hand layouts for the first four levels (order[cell] = book id). Verified by tools/validate.js */
const HAND={
 1:[4,1,2,7, 0,5,6,3],          // centre 2x2 already home & frozen; swap two corners across shelves  -> 2 moves
 2:[3,0,1,2, 5,6,4,7],          // block 0-1-2 slides left; block 5-6 slides right                    -> 2 moves
 3:[5,1,7,3,9, 0,6,2,8,4],      // three vertical swaps between the shelves                          -> 3 moves
 4:[1,2,3,4,0, 5,8,6,7,9],      // a 4-book block + a pair: "one move, four books home"               -> 2 moves
};

function typeOf(L){if(ONBOARD[L])return ONBOARD[L].t;if(INTRO_AT[L])return 'I';
  const c=Math.floor((L-1)/10);return PATTERNS[PATTERN_ORDER[c%PATTERN_ORDER.length]][(L-1)%10]}

/* ---------- bands 1..500 (cols <= 7 keeps every book >= ~47 px wide on a 360 dp phone) ---------- */
const BANDS=[
 {from:1,  to:10, name:'Onboarding',    wrAdj:0},
 {from:11, to:30, name:'Learning',      wrAdj:.06, grid:{E:[3,5],B:[3,5],I:[3,5],N:[3,6],M:[3,6],H:[4,5],P:[4,6]}},
 {from:31, to:60, name:'Development',   wrAdj:.03, grid:{E:[3,6],B:[3,6],I:[3,6],N:[4,5],M:[4,6],H:[4,6],P:[4,7]}},
 {from:61, to:100,name:'First trials',  wrAdj:0,   grid:{E:[4,5],B:[4,5],I:[4,5],N:[4,6],M:[4,6],H:[4,7],P:[5,6]}},
 {from:101,to:200,name:'Core',          wrAdj:-.02,grid:{E:[4,6],B:[4,6],I:[4,6],N:[4,7],M:[5,6],H:[5,7],P:[5,7]}},
 {from:201,to:350,name:'Advanced',      wrAdj:-.03,grid:{E:[4,6],B:[4,6],I:[4,6],N:[5,6],M:[5,7],H:[5,7],P:[6,7]}},
 {from:351,to:1e9,name:'Late game',     wrAdj:-.04,grid:{E:[5,6],B:[4,7],I:[5,6],N:[5,7],M:[5,7],H:[6,7],P:[6,7]}}];
const bandOf=L=>BANDS.find(b=>L>=b.from&&L<=b.to);
/* Golden Frame: on shelves of 30+ books, books that reach home on the outer edge lock in place (hard types) */
const FRAME_MIN=30;

/* ---------- mechanics: intro level, then a 4-level practice window, then the regular rotation ---------- */
const MECH=[
 {k:'stars',  at:7,  name:'Star Books',   kind:'helper', text:'+3 moves when placed'},
 {k:'hidden', at:14, name:'Mystery Books',kind:'obstacle',text:'reveal when a neighbour glues'},
 {k:'locks',  at:16, name:'Locked Books', kind:'obstacle',text:'open after glues next to them'},
 {k:'keyBook',at:22, name:'Key Book',     kind:'helper', text:'opens every lock at once'},
 {k:'links',  at:31, name:'Ribbons',      kind:'obstacle',text:'tied books move together'},
 {k:'ticks',  at:41, name:'Ticking Books',kind:'obstacle',text:'place before 0 or lose 3 moves'},
 {k:'lockHp', at:46, name:'Double Locks', kind:'obstacle',text:'need two glues to open'},
];
const INTRO_AT={};MECH.forEach(m=>{if(!ONBOARD[m.at])INTRO_AT[m.at]=m.k});
const unlocked=(k,L)=>L>=MECH.find(m=>m.k===k).at;
/* v9 hub: painting schedule by readability. Paintings go from the most readable (low V) to the hardest; inside every
   10-level cycle the most readable one goes to the easiest type and the least readable to the Peak. After ART.length levels it repeats. */
const ART_BY_V=ART.map((a,i)=>i).sort((x,y)=>ART[x].v-ART[y].v||x-y);
const TYPE_RANK={E:0,B:1,I:2,N:3,M:4,H:5,P:6};
const ART_SEQ=[];{const n=ART.length;for(let c=0;c*10<n;c++){const lv=[];for(let k=c*10;k<Math.min(n,c*10+10);k++)lv.push(k+1);
  const pool=ART_BY_V.slice(c*10,c*10+lv.length);const byHard=lv.slice().sort((a,b)=>(TYPE_RANK[typeOf(a)]-TYPE_RANK[typeOf(b)])||a-b);
  byHard.forEach((L,i)=>ART_SEQ[L-1]=pool[i])}}
const artOf=L=>ART[ART_SEQ[(L-1)%ART.length]];
/* obstacle-type budget per level type: never more than two obstacle types at once */
const OB_BUDGET={E:0,B:0,I:0,N:1,M:1,H:2,P:2};

function modsOf(L,t,n){const m={locks:0,lockHp:1,links:0,hidden:0,stars:0,ticks:0,tickN:7,keyBook:0};
  const intro=INTRO_AT[L]||(ONBOARD[L]&&ONBOARD[L].mech);
  if(intro){ // intro levels teach exactly one thing, at gentle strength
    if(intro==='stars')m.stars=1;if(intro==='hidden')m.hidden=2;if(intro==='locks')m.locks=1;
    if(intro==='keyBook'){m.locks=2;m.keyBook=1}if(intro==='links')m.links=1;if(intro==='ticks'){m.ticks=1;m.tickN=8}
    if(intro==='lockHp'){m.locks=1;m.lockHp=2}return m}
  /* helpers: hard beats hand out relief */
  if(unlocked('stars',L)&&L>10){if(t==='H')m.stars=1;if(t==='P')m.stars=2}
  /* obstacles: pick up to OB_BUDGET types from the unlocked pool; a mechanic in its practice window goes first */
  const pool=['hidden','locks','links','ticks'].filter(k=>unlocked(k,L)&&!(k==='ticks'&&!(t==='M'||t==='P')));
  const fresh=pool.filter(k=>{const at=MECH.find(x=>x.k===k).at;return L>at&&L<=at+4});
  const c=Math.floor((L-1)/10);const rot=pool.slice(c%Math.max(1,pool.length)).concat(pool.slice(0,c%Math.max(1,pool.length)));
  const pick=[...new Set(fresh.concat(rot))].slice(0,OB_BUDGET[t]);
  const big=n>=24;
  pick.forEach(k=>{
    if(k==='locks')m.locks={N:1,M:big?2:1,H:big?3:2,P:3}[t];
    if(k==='hidden')m.hidden={N:2,M:2,H:Math.max(2,Math.round(n/10)),P:Math.max(3,Math.round(n/8))}[t];
    if(k==='links')m.links={N:1,M:1,H:2,P:2}[t];
    if(k==='ticks'){m.ticks=t==='P'&&L>=60?2:1;m.tickN=t==='P'?6:7}});
  if(unlocked('lockHp',L)&&(t==='H'||t==='P')&&m.locks)m.lockHp=2;
  if(unlocked('keyBook',L)&&m.locks>=2&&(t==='H'||t==='P'))m.keyBook=1;
  /* density cap: obstacle objects <= 15% of the shelf */
  const cap=Math.ceil(n*.15);let tot=()=>m.locks+m.hidden+m.links*2+m.ticks;
  while(tot()>cap){if(m.hidden>1)m.hidden--;else if(m.links>1)m.links--;else if(m.locks>1)m.locks--;else break}
  return m}

/* ---------- remote overrides (LiveOps). Applied on the NEXT attempt only, never mid-attempt. ---------- */
const LEVEL_OVERRIDES={/* e.g. 37:{ver:2, movesDelta:+2, reason:'APS 2.3, near-fail 40%'} , 52:{ver:2, seedShift:1} */};

function levelDef(L){const t=typeOf(L),T=TYPES[t],band=bandOf(L),ob=ONBOARD[L];
  const [rows,cols]=ob?ob.grid:band.grid[t];const n=rows*cols;const art=artOf(L);const ovr=LEVEL_OVERRIDES[L]||{};
  let wr=ob&&ob.wr?ob.wr:T.wr+(HARD(t)?band.wrAdj:0);
  return{L,t,type:T.name,d:T.d,role:T.name.toLowerCase(),band:band.name,rows,cols,n,mods:modsOf(L,t,n),art,seed:L*7919+13+(ovr.seedShift||0)*104729,
    wr,freeze:!!T.freeze,frame:!T.freeze&&n>=FRAME_MIN,purpose:ob?ob.purpose:(INTRO_AT[L]?'Introduce '+MECH.find(m=>m.k===INTRO_AT[L]).name:''),
    hand:HAND[L]||null,ver:ovr.ver||1,ovr,
    badge:t==='P'?'Masterpiece':t==='H'?'Hard':'',reward:T.reward+(L>100?10:0)}}

/* what's coming next: drives the home-screen teaser and the win-screen hint (curiosity loop) */
function upcoming(L,extra=[]){const list=[];
  MECH.forEach(m=>list.push({L:m.at,kind:'mech',name:m.name,text:m.text}));
  for(let x=Math.ceil(L/10)*10;x<L+20;x+=10)if(x>=L)list.push({L:x,kind:'peak',name:'Masterpiece',text:'big reward'});
  const albums=[],seenA=new Set();for(let k=0;k<ART.length;k++){const a=artOf(k+1);if(!seenA.has(a.album)){seenA.add(a.album);if(k)albums.push({L:k+1,kind:'album',name:a.album,text:'new collection & room'})}}list.push(...albums);
  return list.concat(extra).filter(x=>x.L>=L).sort((a,b)=>a.L-b.L||(a.kind==='mech'?-1:1))}

/* deterministic RNG */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

if(typeof module!=='undefined')module.exports={ART,ART_SEQ,artOf,THEMES,themeOf,LIB_BG,libOf,TYPES,HARD,PATTERNS,PATTERN_ORDER,ONBOARD,HAND,BANDS,bandOf,FRAME_MIN,MECH,INTRO_AT,OB_BUDGET,
  LEVEL_OVERRIDES,typeOf,modsOf,levelDef,upcoming,rng};
if(typeof window!=='undefined')Object.assign(window,{ART,ART_SEQ,artOf,THEMES,themeOf,LIB_BG,libOf,TYPES,HARD,PATTERNS,PATTERN_ORDER,ONBOARD,HAND,BANDS,bandOf,FRAME_MIN,MECH,INTRO_AT,OB_BUDGET,LEVEL_OVERRIDES,typeOf,modsOf,levelDef,upcoming,rng});

/* gallery sets of 10 (patch_gallery_sets.py, 2026-10-23) */
