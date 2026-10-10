"""Regressions for ambiguous source labels and merchandise macro categories."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("fiere_build", Path(__file__).with_name("build-fiere.py"))
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class MerchandiseSectorsTest(unittest.TestCase):
    def test_source_labels(self):
        cases = [
            ("Non Alimentare", ["non-alimentare"]),
            ("Non Alim.", ["non-alimentare"]),
            ("prodotti non alimentari", ["non-alimentare"]),
            ("previsto misto ma attualmente solo settore non alimentare", ["non-alimentare"]),
            ("Alimentari e non alimentari", ["alimentare", "non-alimentare"]),
            ("Alimentare/non alimentare", ["alimentare", "non-alimentare"]),
            ("Non alimentare; escluso alimentare", ["non-alimentare"]),
            ("Artigianato; non ammessi alimentari", ["non-alimentare", "artigianato"]),
            ("Alimentari (ad esclusione di ambulanti con autorizzazioni per somministrazione alimenti e bevande) e non alimentari", ["alimentare", "non-alimentare"]),
            ("Dolciumi e formaggi con divieto di somministrazione", ["alimentare"]),
            ("Prodotti tipici, artigianato; esclusa somministrazione", ["alimentare", "non-alimentare", "artigianato"]),
            ("Antiquariato, modernariato e collezionismo", ["non-alimentare", "antiquariato"]),
            ("Vintage e riuso", ["non-alimentare", "antiquariato"]),
            ("Artigianato, antiquariato e alimentare", list(build.MERCHANDISE_SECTORS)),
            ("Hobbistica (verificare ammissione professionisti)", ["non-alimentare", "artigianato"]),
            ("Fatto a mano e fiori", ["non-alimentare", "artigianato"]),
            ("Produttori di vino artigianale e proposte food", ["alimentare"]),
            ("Street food e food truck", ["alimentare"]),
            ("Abbigliamento e calzature", ["non-alimentare"]),
            ("Libri nuovi e usati", ["non-alimentare"]),
            ("Oggettistica, usato, hobbistica", ["non-alimentare", "artigianato"]),
            ("Misto", []), ("Merci varie", []), ("", []),
            ("Categorie merceologiche da verificare con l’organizzatore.", []),
        ]
        for source, expected in cases:
            with self.subTest(source=source):
                self.assertEqual(build.merchandise_sectors({"name": "Fiera di San Giuseppe", "sectors": source}), expected)

    def test_explicit_theme_and_missing_information(self):
        self.assertEqual(build.merchandise_sectors({"name": "Fiera Antiquaria"}), ["non-alimentare", "antiquariato"])
        self.assertEqual(build.merchandise_sectors({"name": "Mercatino del brocantage"}), ["non-alimentare", "antiquariato"])
        self.assertEqual(build.merchandise_sectors({"name": "Fiera dell’artigianato"}), ["non-alimentare", "artigianato"])
        self.assertEqual(build.merchandise_sectors({"name": "Sagra di San Giuseppe", "category": "sagra"}), [])
        self.assertEqual(build.merchandise_sectors({"name": "Fiera del vino", "sectors": "Non alimentare"}), ["non-alimentare"])


if __name__ == "__main__":
    unittest.main()
