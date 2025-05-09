# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

from datetime import date

project = 'CITYNEXUS'
copyright = f'{date.today().year} , Solenix Engineering GmbH'
author = 'Solenix Engineering GmbH'
release = '1.0'
extensions = [
'sphinx_rtd_theme',
]

html_theme = "sphinx_rtd_theme"
html_theme_options = {
'display_version': True,
}
html_static_path = ['_static']

rst_epilog = f'''
.. |project| replace:: {project}
'''
nitpicky = True
html_css_files = [
'./service-doc.css'
]