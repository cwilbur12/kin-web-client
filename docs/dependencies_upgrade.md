## Tooling ##

NPM Check Updates is a nice utility to see what dependencies need an update. You can safely install it globally:

~~~~
npm install -g npm-check-updates
~~~~

## Misc. ##
### FullCalendar update ###

#### Rebase CSS ####
Download both FullCalendar versions (the one mentioned in our custom CSS header and the one you're upgrading Kin to), and create a patch, diff-ing between the 2 versions:

~~~~
diff fullcalendar-3.0.0/dist/fullcalendar.css fullcalendar-3.0.1/dist/fullcalendar.css > fc_css_upgrade.patch
~~~~

And apply it on top of our custom CSS:

~~~~
patch kin-web/src/public/styles/custom_fc.scss -i fc_css_upgrade.patch
~~~~
